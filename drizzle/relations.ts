import { relations } from "drizzle-orm/relations";
import { user, account, organization, invitation, membership, session, userSubscriptions } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	invitations: many(invitation),
	memberships: many(membership),
	sessions: many(session),
	userSubscriptions: many(userSubscriptions),
}));

export const invitationRelations = relations(invitation, ({one}) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	invitations: many(invitation),
	memberships: many(membership),
}));

export const membershipRelations = relations(membership, ({one}) => ({
	user: one(user, {
		fields: [membership.userId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [membership.organizationId],
		references: [organization.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({one}) => ({
	user: one(user, {
		fields: [userSubscriptions.userId],
		references: [user.id]
	}),
}));