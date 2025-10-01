import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { membership, organization as organizationTable, project as projectTable, document as documentTable } from "@/lib/schema";
import { and, eq, inArray } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  try {
    const { orgId, projectId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { items } = body as { items: Array<{ id: string; position: number; parentId?: string | null }> };
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const orgRows = await db.select().from(organizationTable).where(eq(organizationTable.slug, orgId)).limit(1);
    if (orgRows.length === 0) return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });

    const isMember = await db
      .select()
      .from(membership)
      .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, orgRows[0].id)))
      .limit(1);
    if (isMember.length === 0) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const ids = items.map(i => i.id);
    const existing = await db
      .select({ id: documentTable.id })
      .from(documentTable)
      .where(and(eq(documentTable.organizationId, orgRows[0].id), eq(documentTable.projectId, projectId), inArray(documentTable.id, ids)));
    const existingIds = new Set(existing.map(r => r.id));
    for (const item of items) {
      if (!existingIds.has(item.id)) {
        return NextResponse.json({ success: false, error: `Document not in project: ${item.id}` }, { status: 400 });
      }
    }

    // Update sequentially; could be batched if your driver supports it
    for (const item of items) {
      await db
        .update(documentTable)
        .set({ position: item.position, parentId: item.parentId ?? null })
        .where(eq(documentTable.id, item.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder documents:", error);
    return NextResponse.json({ success: false, error: "Failed to reorder documents" }, { status: 500 });
  }
}


