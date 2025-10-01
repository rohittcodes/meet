import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { membership, organization as organizationTable, project as projectTable, document as documentTable } from "@/lib/schema";
import { and, eq } from "drizzle-orm";

async function ensureAccess(request: NextRequest, orgSlug: string, projectId: string, documentId?: string) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return { status: 401 as const, error: "Unauthorized" };

  const orgRows = await db.select().from(organizationTable).where(eq(organizationTable.slug, orgSlug)).limit(1);
  if (orgRows.length === 0) return { status: 404 as const, error: "Organization not found" };

  const isMember = await db
    .select()
    .from(membership)
    .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, orgRows[0].id)))
    .limit(1);
  if (isMember.length === 0) return { status: 403 as const, error: "Access denied" };

  const projRows = await db
    .select()
    .from(projectTable)
    .where(and(eq(projectTable.organizationId, orgRows[0].id), eq(projectTable.id, projectId)))
    .limit(1);
  if (projRows.length === 0) return { status: 404 as const, error: "Project not found" };

  if (documentId) {
    const docRows = await db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.id, documentId), eq(documentTable.projectId, projectId), eq(documentTable.organizationId, orgRows[0].id)))
      .limit(1);
    if (docRows.length === 0) return { status: 404 as const, error: "Document not found" };
  }

  return { status: 200 as const, orgId: orgRows[0].id, userId: session.user.id };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; projectId: string; documentId: string }> }
) {
  try {
    const { orgId, projectId, documentId } = await params;
    const access = await ensureAccess(request, orgId, projectId, documentId);
    if (access.status !== 200) return NextResponse.json({ success: false, error: access.error }, { status: access.status });

    const body = await request.json();
    const { title, content } = body ?? {};

    const [updated] = await db
      .update(documentTable)
      .set({
        ...(typeof title === "string" ? { title } : {}),
        ...(typeof content !== "undefined" ? { content: typeof content === 'string' ? JSON.parse(content) : content } : {}),
        lastEditedAt: new Date(),
        lastEditedBy: access.userId,
      })
      .where(and(eq(documentTable.id, documentId)))
      .returning();

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error("Failed to update document:", error);
    return NextResponse.json({ success: false, error: "Failed to update document" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; projectId: string; documentId: string }> }
) {
  try {
    const { orgId, projectId, documentId } = await params;
    const access = await ensureAccess(request, orgId, projectId, documentId);
    if (access.status !== 200) return NextResponse.json({ success: false, error: access.error }, { status: access.status });

    await db.delete(documentTable).where(eq(documentTable.id, documentId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete document:", error);
    return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 });
  }
}


