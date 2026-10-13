import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { MonitoredJourney } from "@/models/MonitoredJourney";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ pnr: string }> },
) {
  try {
    const { pnr } = await params;

    if (!pnr) {
      return NextResponse.json(
        { success: false, error: "PNR is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const result = await MonitoredJourney.findOneAndDelete({ pnrNumber: pnr });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Journey not found in database" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `PNR ${pnr} removed from monitoring`,
    });
  } catch (error) {
    console.error("DELETE /api/pnrs/[pnr] error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete monitored journey",
      },
      { status: 500 },
    );
  }
}
