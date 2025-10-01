import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { membership, organization as organizationTable, project as projectTable, document as documentTable } from "@/lib/schema";
import { slugify } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  try {
    const { orgId, projectId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const orgRows = await db.select().from(organizationTable).where(eq(organizationTable.slug, orgId)).limit(1);
    if (orgRows.length === 0) return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });

    const isMember = await db
      .select()
      .from(membership)
      .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, orgRows[0].id)))
      .limit(1);
    if (isMember.length === 0) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const projRows = await db
      .select()
      .from(projectTable)
      .where(and(eq(projectTable.organizationId, orgRows[0].id), eq(projectTable.id, projectId)))
      .limit(1);
    if (projRows.length === 0) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    const docs = await db
      .select()
      .from(documentTable)
      .where(and(eq(documentTable.organizationId, orgRows[0].id), eq(documentTable.projectId, projectId)));

    return NextResponse.json({ success: true, documents: docs });
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; projectId: string }> }
) {
  try {
    const { orgId, projectId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, type } = body ?? {};
    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const orgRows = await db.select().from(organizationTable).where(eq(organizationTable.slug, orgId)).limit(1);
    if (orgRows.length === 0) return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });

    const isMember = await db
      .select()
      .from(membership)
      .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, orgRows[0].id)))
      .limit(1);
    if (isMember.length === 0) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const projRows = await db
      .select()
      .from(projectTable)
      .where(and(eq(projectTable.organizationId, orgRows[0].id), eq(projectTable.id, projectId)))
      .limit(1);
    if (projRows.length === 0) return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 });

    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const baseSlug = slugify(title);
    // Ensure unique slug per project
    let candidate = baseSlug || `untitled-${Date.now()}`;
    let suffix = 1;
    // naive uniqueness check
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await db
        .select()
        .from(documentTable)
        .where(and(eq(documentTable.projectId, projectId), eq(documentTable.slug, candidate)))
        .limit(1);
      if (existing.length === 0) break;
      candidate = `${baseSlug}-${suffix++}`;
    }

    const [created] = await db
      .insert(documentTable)
      .values({
        id,
        title,
        content: typeof content === "string" ? JSON.parse(content) : content ?? null,
        organizationId: orgRows[0].id,
        projectId,
        createdBy: session.user.id,
        type: typeof type === "string" ? type : "document",
        isPublic: false,
        slug: candidate,
      })
      .returning();

    return NextResponse.json({ success: true, document: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create document:", error);
    return NextResponse.json({ success: false, error: "Failed to create document" }, { status: 500 });
  }
}


