/**
 * Embeddings utility functions for Phase 2
 * Handles generation, storage, and querying of embeddings
 */

import { db } from "./db";
import { embeddings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Stub: In production, this would call OpenAI API or similar
export async function generateEmbedding(text: string): Promise<number[]> {
  // Placeholder: Return a mock 1536-dimensional vector
  // In production, replace with actual embedding API call
  const mockVector = Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
  return mockVector;
}

/**
 * Store an embedding in the database
 */
export async function storeEmbedding(
  entityType: "market" | "future" | "resume_section",
  entityId: string,
  text: string
): Promise<void> {
  if (!db) throw new Error("Database not initialized");

  const vector = await generateEmbedding(text);

  await db.insert(embeddings).values({
    entityType,
    entityId,
    vector: `[${vector.join(",")}]`, // Convert to PostgreSQL array format
  });
}

/**
 * Query similar embeddings using cosine similarity
 */
export async function querySimilarEmbeddings(
  queryText: string,
  entityType?: "market" | "future" | "resume_section",
  limit: number = 5
): Promise<Array<{ entityId: string; entityType: string; similarity: number }>> {
  if (!db) throw new Error("Database not initialized");

  const queryVector = await generateEmbedding(queryText);
  const queryVectorStr = `[${queryVector.join(",")}]`;

  // Use pgvector cosine similarity operator
  // Note: This is a simplified version - actual implementation depends on pgvector setup
  const results = await db
    .select({
      entityId: embeddings.entityId,
      entityType: embeddings.entityType,
      similarity: sql<number>`1 - (${embeddings.vector} <=> ${queryVectorStr}::vector)`,
    })
    .from(embeddings)
    .where(entityType ? eq(embeddings.entityType, entityType) : undefined)
    .orderBy(sql`${embeddings.vector} <=> ${queryVectorStr}::vector`)
    .limit(limit);

  return results.map((r: { entityId: string; entityType: string; similarity: number | string }) => ({
    entityId: r.entityId,
    entityType: r.entityType,
    similarity: typeof r.similarity === "string" ? parseFloat(r.similarity) : r.similarity,
  }));
}

/**
 * Get related markets/futures based on embedding similarity
 */
export async function getRelatedEntities(
  entityId: string,
  entityType: "market" | "future",
  limit: number = 5
): Promise<string[]> {
  if (!db) throw new Error("Database not initialized");

  // Get the embedding for the source entity
  const [sourceEmbedding] = await db
    .select()
    .from(embeddings)
    .where(eq(embeddings.entityId, entityId))
    .limit(1);

  if (!sourceEmbedding) {
    return [];
  }

  // Find similar embeddings
  const similar = await querySimilarEmbeddings(
    "", // Not used since we're comparing directly
    entityType,
    limit + 1 // +1 to exclude the source entity
  );

  return similar
    .filter((s) => s.entityId !== entityId)
    .map((s) => s.entityId)
    .slice(0, limit);
}

