import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getPublicSettings();

  return NextResponse.json(
    {
      ok: true,
      settings,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}