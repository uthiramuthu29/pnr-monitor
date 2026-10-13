import mongoose from "mongoose";
import dns from "dns";
import fs from "fs";
import path from "path";

// Set Google and Cloudflare DNS to resolve SRV records on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setServers is not allowed
}

function getEnvValue(key: string): string {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const regex = new RegExp(`^\\s*${key}\\s*=\\s*["']?([^"'\\r\\n]+)`, "m");
      const match = content.match(regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch {}
  return process.env[key] || "";
}

// Fallback direct non-SRV connection string (immune to Windows querySrv DNS issues)
const DIRECT_FALLBACK_URI =
  "mongodb://uthiramuthusp29_db_user:xBBAFkxkLwxaEVGN@ac-waziytc-shard-00-00.bibwod7.mongodb.net:27017,ac-waziytc-shard-00-01.bibwod7.mongodb.net:27017,ac-waziytc-shard-00-02.bibwod7.mongodb.net:27017/?ssl=true&replicaSet=atlas-5j86pu-shard-0&authSource=admin";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  const uri = getEnvValue("MONGODB_URI") || process.env.MONGODB_URI || DIRECT_FALLBACK_URI;

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .catch((primaryErr) => {
        // If querySrv fails on Windows/ISP DNS, automatically fallback to direct replica set connection
        if (
          primaryErr &&
          (primaryErr.message?.includes("querySrv") ||
            primaryErr.code === "ECONNREFUSED")
        ) {
          console.warn(
            "[MongoDB] SRV DNS resolution failed on Windows, falling back to direct replica set connection...",
          );
          return mongoose.connect(DIRECT_FALLBACK_URI, opts);
        }
        throw primaryErr;
      })
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
