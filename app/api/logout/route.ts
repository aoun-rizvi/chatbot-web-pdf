import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}