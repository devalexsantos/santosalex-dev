-- Add the new array column (NOT NULL, default empty array)
ALTER TABLE "Project" ADD COLUMN "categories" "ProjectCategory"[] NOT NULL DEFAULT ARRAY[]::"ProjectCategory"[];

-- Backfill: each existing project keeps its single category as a one-element array
UPDATE "Project" SET "categories" = ARRAY["category"]::"ProjectCategory"[];

-- Drop the old single-category index and column
DROP INDEX IF EXISTS "Project_category_idx";
ALTER TABLE "Project" DROP COLUMN "category";
