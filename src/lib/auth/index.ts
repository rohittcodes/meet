import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification, membership, organization as organizationTable, userSubscriptions } from "@/lib/schema";
import { organization } from "better-auth/plugins";
import { eq, and } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification, organization: organizationTable, member: membership, userSubscriptions },
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword(data, req) {
      // TODO: Send reset password email with link to reset password page
    }
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        const userSubscription = await db
          .select()
          .from(userSubscriptions)
          .where(
            and(
              eq(userSubscriptions.userId, user.id),
              eq(userSubscriptions.status, "active")
            )
          )
          .limit(1);

        if (userSubscription.length === 0) {
          const existingOrgs = await db.select().from(membership).where(eq(membership.userId, user.id));
          return existingOrgs.length === 0; // Allow only if no existing organizations
        }

        const subscription = userSubscription[0];
        
        const { getPlanById } = await import("@/lib/subscription-plans");
        const plan = getPlanById(subscription.planId);
        
        if (!plan) {
          const existingOrgs = await db.select().from(membership).where(eq(membership.userId, user.id));
          return existingOrgs.length === 0;
        }
        
        const existingOrgs = await db.select().from(membership).where(eq(membership.userId, user.id));
        return plan.maxOrganizations === -1 || existingOrgs.length < plan.maxOrganizations;
      },
      organizationHooks: {
        beforeCreateOrganization: async ({ organization, user }) => {
          return {
            data: {
              ...organization,
              metadata: {
                createdBy: user.id,
                createdAt: new Date().toISOString(),
              },
            },
          };
        },
        afterCreateOrganization: async ({ organization, member, user }) => {
          console.log(`Organization ${organization.name} created by user ${user.email}`);
        },
        beforeUpdateOrganization: async ({ organization, user, member }) => {
          return {
            data: {
              ...organization,
              name: organization.name?.toLowerCase(),
            },
          };
        },
        afterUpdateOrganization: async ({ organization, user, member }) => {
          console.log(`Organization ${organization?.name} updated by user ${user.email}`);
        },
      },
    })
  ],
});
