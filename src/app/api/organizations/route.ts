import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { organization, membership } from "@/lib/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userMemberships = await db
      .select()
      .from(membership)
      .where(eq(membership.userId, session.user.id));

    if (userMemberships.length === 0) {
      const allOrganizations = await db.select().from(organization);
      
      if (allOrganizations.length > 0) {
        const memberships = [];
        for (const org of allOrganizations) {
          const newMembership = await db.insert(membership).values({
            id: `membership_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: session.user.id,
            organizationId: org.id,
            role: "owner",
          }).returning();
          memberships.push(newMembership[0]);
        }
        
        const orgIds = [...new Set(memberships.map(m => m.organizationId))];
        const organizations = await db
          .select()
          .from(organization)
          .where(inArray(organization.id, orgIds));

        return NextResponse.json({
          success: true,
          organizations: organizations.map(org => ({
            id: org.id,
            name: org.name,
            slug: org.slug,
            image: org.image,
            metadata: org.metadata,
            createdAt: org.createdAt,
          })),
        });
      }
      
      return NextResponse.json({
        success: true,
        organizations: [],
      });
    }

    const orgIds = [...new Set(userMemberships.map(m => m.organizationId))];

    const organizations = await db
      .select()
      .from(organization)
      .where(inArray(organization.id, orgIds));

    return NextResponse.json({
      success: true,
      organizations: organizations.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        image: org.image,
        metadata: org.metadata,
        createdAt: org.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch organizations" },
      { status: 500 }
    );
  }
}
