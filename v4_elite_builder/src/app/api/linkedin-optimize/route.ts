import { NextResponse } from "next/server";
import {
  buildLinkedInRecommendations,
  validateLinkedInOptimizeRequest
} from "@/lib/linkedin-optimizer.mjs";

export async function POST(request: Request) {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateLinkedInOptimizeRequest(rawBody);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status }
    );
  }

  return NextResponse.json(buildLinkedInRecommendations(validation));
}
