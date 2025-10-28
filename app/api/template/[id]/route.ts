import { NextRequest } from "next/server";
import {  NextResponse } from "next/server";

import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";
import fs from "fs/promises";
import { 
  readTemplateStructureFromJson, 
  saveTemplateStructureToJson 
} from "@/modules/playground/lib/path-to-json";

function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Await params (Next.js requirement)
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    // ✅ Base URL of your deployed templates
    const BASE_URL = "https://viber-templates.vercel.app/templates";

    // ✅ Construct remote URL
    const templateUrl = `${BASE_URL}/${id}/template.json`;
    console.log("Fetching remote template:", templateUrl);

    const res = await fetch(templateUrl);

    if (!res.ok) {
      throw new Error(`Template not found or inaccessible: ${templateUrl}`);
    }

    // ✅ Ensure it's valid JSON (not HTML)
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error(`Invalid response format. Expected JSON but got: ${contentType}`);
    }

    const json = await res.json();

    return NextResponse.json({ success: true, template: json });
  } catch (error) {
    console.error("Error fetching remote template:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load template" },
      { status: 500 }
    );
  }
}