import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createAuthToken,
  verifyPassword,
} from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type." },
        {
          status: 415,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("password" in body) ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { error: "Password is required." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const validPassword = await verifyPassword(body.password);

    if (!validPassword) {
      // Deliberately generic response.
      return NextResponse.json(
        { error: "Invalid password." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const token = await createAuthToken();

    const response = NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,

      // Prevent JavaScript from reading the cookie
      httpOnly: true,

      // HTTPS only in production
      secure: process.env.NODE_ENV === "production",

      // Protect against most cross-site request scenarios
      sameSite: "strict",

      // Cookie is valid across the whole application
      path: "/",

      // Browser expires it too
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Authentication service unavailable." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}