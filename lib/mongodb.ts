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
  const uri = getEnvValue("MONGODB_URI") || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not defined. Please configure MONGODB_URI in your environment variables (.env.local or Vercel Settings)."
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
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
