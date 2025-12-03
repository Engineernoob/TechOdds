import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { collections, collectionMarkets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const collectionsList = await db.select().from(collections).orderBy(collections.createdAt);

    return NextResponse.json(collectionsList);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, createdBy } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [collection] = await db
      .insert(collections)
      .values({
        title,
        description: description || null,
        createdBy: createdBy || null,
      })
      .returning();

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}

