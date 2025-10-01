import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
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

    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.userId, session.user.id),
          eq(userSubscriptions.status, "active")
        )
      )
      .limit(1);

    if (subscription.length === 0) {
      return NextResponse.json({
        success: true,
        subscription: null,
      });
    }

    const userSub = subscription[0];

    return NextResponse.json({
      success: true,
      subscription: {
        id: userSub.id,
        userId: userSub.userId,
        planId: userSub.planId,
        status: userSub.status,
        currentPeriodStart: userSub.currentPeriodStart,
        currentPeriodEnd: userSub.currentPeriodEnd,
        cancelAtPeriodEnd: userSub.cancelAtPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Failed to fetch current subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
