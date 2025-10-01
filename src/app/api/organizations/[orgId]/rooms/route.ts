import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { meetingRoom, membership, organization as organizationTable } from "@/lib/schema";
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

    const rooms = await db
      .select()
      .from(meetingRoom)
      .where(eq(meetingRoom.organizationId, org[0].id));

    return NextResponse.json({ success: true, rooms });
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch rooms" }, { status: 500 });
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
    const { name, description, maxParticipants } = body ?? {};
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

    const id = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const [created] = await db
      .insert(meetingRoom)
      .values({
        id,
        name,
        description: description ?? null,
        organizationId: org[0].id,
        createdBy: session.user.id,
        isActive: true,
        maxParticipants: typeof maxParticipants === "number" ? maxParticipants : 50,
        settings: {
          allowScreenShare: true,
          allowRecording: true,
          requireAuth: true,
          muteOnJoin: false,
        },
      })
      .returning();

    return NextResponse.json({ success: true, room: created }, { status: 201 });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json({ success: false, error: "Failed to create room" }, { status: 500 });
  }
}


