ALTER TABLE "membership" RENAME COLUMN "organization_id" TO "org_id";--> statement-breakpoint
ALTER TABLE "membership" DROP CONSTRAINT "membership_organization_id_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;