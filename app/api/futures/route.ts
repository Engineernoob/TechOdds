import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { applicantFutures } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "active", "anonymous", "ending_soon"
    const userId = searchParams.get("userId");

    let query = db.select().from(applicantFutures);

    if (filter === "active") {
      // Filter by target date in the future
      query = query.where(gte(applicantFutures.targetDate, new Date()));
    } else if (filter === "anonymous") {
      query = query.where(eq(applicantFutures.anon, true));
    } else if (filter === "ending_soon") {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 7);
      query = query.where(
        and(
          gte(applicantFutures.targetDate, new Date()),
          lte(applicantFutures.targetDate, soonDate)
        )
      );
    }

    if (userId) {
      query = query.where(eq(applicantFutures.userId, userId));
    }

    const futures = await query.orderBy(applicantFutures.createdAt);

    return NextResponse.json(futures);
  } catch (error) {
    console.error("Error fetching futures:", error);
    return NextResponse.json({ error: "Failed to fetch futures" }, { status: 500 });
  }
}

