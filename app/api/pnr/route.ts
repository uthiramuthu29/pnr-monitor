import { NextResponse } from "next/server";

const RAPIDAPI_HOST = "irctc-indian-railway-pnr-status.p.rapidapi.com"

export async function GET(request: Request) {
    try{
        const { searchParams } = new URL(request.url);
        const pnr = searchParams.get("pnr");

        if(!pnr) {
            return NextResponse.json(
                {error: "PNR is required"},
                {status: 400}
            )
        }

        if (!/^\d{10}$/.test(pnr)) {
            return NextResponse.json(
                {error: "PNR must contain exactly 10 digits"},
                {status: 400}
            )
        }

        const response = await fetch(
            `https://${RAPIDAPI_HOST}/getPNRStatus/${pnr}`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-host" : RAPIDAPI_HOST,
                    "x-rapidapi-key" : process.env.RAPIDAPI_KEY!,
                }
            }
        );

        if(!response.ok){
            return NextResponse.json(
                {error: "Failed to fetch PNR status"},
                {status: response.status}
            )
        }

        const data = await response.json();

        return NextResponse.json(data);

    } catch(error) {
        console.error("PNR API error:", error)

        return NextResponse.json(
            {error: "Something went wrong while checking PNR"},
            {status: 500}
        )
    }
}