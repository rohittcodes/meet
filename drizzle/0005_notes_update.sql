-- Add hierarchical and metadata fields to document, and switch content to JSON
ALTER TABLE "document" ALTER COLUMN "content" TYPE json USING NULLIF("content", '')::json;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "parent_id" text;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "position" integer DEFAULT 0;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "slug" text;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "last_edited_by" text;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false NOT NULL;
ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "last_edited_at" timestamp DEFAULT now();

-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_document_project_hierarchy ON "document" ("project_id", "parent_id", "position");

