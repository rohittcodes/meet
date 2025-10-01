import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { membership, organization as organizationTable, project } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const org = await db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.slug, orgId))
      .limit(1);
    if (org.length === 0) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const membershipRow = await db
      .select()
      .from(membership)
      .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, org[0].id)))
      .limit(1);
    if (membershipRow.length === 0) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const projects = await db.select().from(project).where(eq(project.organizationId, org[0].id));
    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body ?? {};
    if (typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const org = await db
      .select()
      .from(organizationTable)
      .where(eq(organizationTable.slug, orgId))
      .limit(1);
    if (org.length === 0) {
      return NextResponse.json({ success: false, error: "Organization not found" }, { status: 404 });
    }

    const membershipRow = await db
      .select()
      .from(membership)
      .where(and(eq(membership.userId, session.user.id), eq(membership.organizationId, org[0].id)))
      .limit(1);
    if (membershipRow.length === 0) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const id = `project_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const [created] = await db
      .insert(project)
      .values({
        id,
        name,
        description: description ?? null,
        organizationId: org[0].id,
        createdBy: session.user.id,
        status: "active",
        color: typeof color === "string" ? color : "#3B82F6",
      })
      .returning();

    return NextResponse.json({ success: true, project: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json({ success: false, error: "Failed to create project" }, { status: 500 });
  }
}


