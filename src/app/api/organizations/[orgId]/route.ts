import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organization, membership, user } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orgData = await db
      .select()
      .from(organization)
      .where(eq(organization.slug, orgId))
      .limit(1);

    if (orgData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Organization not found" },
        { status: 404 }
      );
    }

    const org = orgData[0];

    const userMembership = await db
      .select()
      .from(membership)
      .where(
        and(
          eq(membership.userId, session.user.id),
          eq(membership.organizationId, org.id)
        )
      )
      .limit(1);

    if (userMembership.length === 0) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const allMembers = await db
      .select({
        id: membership.id,
        userId: membership.userId,
        organizationId: membership.organizationId,
        role: membership.role,
        createdAt: membership.createdAt,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(membership)
      .innerJoin(user, eq(membership.userId, user.id))
      .where(eq(membership.organizationId, org.id));

    return NextResponse.json({
      success: true,
      organization: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        image: org.image,
        metadata: org.metadata,
        createdAt: org.createdAt,
      },
      members: allMembers.map(member => ({
        id: member.id,
        userId: member.userId,
        organizationId: member.organizationId,
        role: member.role,
        createdAt: member.createdAt,
        user: {
          id: member.userId,
          name: member.userName,
          email: member.userEmail,
          image: member.userImage,
        }
      })),
    });
  } catch (error) {
    console.error("Failed to fetch organization:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
