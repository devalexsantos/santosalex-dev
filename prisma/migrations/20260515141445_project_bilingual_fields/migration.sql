-- Add new nullable JSONB columns to Project
ALTER TABLE "Project" ADD COLUMN "architecture" JSONB;
ALTER TABLE "Project" ADD COLUMN "challenges"   JSONB;

-- Cast ProjectDecision string columns to JSONB using pt-BR as the initial value.
-- Existing rows become { "pt-BR": "<original text>", "en": "" }.
-- The seed will immediately overwrite these with proper bilingual values.
ALTER TABLE "ProjectDecision"
  ALTER COLUMN "title"       TYPE JSONB USING jsonb_build_object('pt-BR', "title",       'en', ''),
  ALTER COLUMN "description" TYPE JSONB USING jsonb_build_object('pt-BR', "description", 'en', ''),
  ALTER COLUMN "reason"      TYPE JSONB USING jsonb_build_object('pt-BR', "reason",       'en', '');

-- Cast ProjectFeature string columns to JSONB in the same way.
ALTER TABLE "ProjectFeature"
  ALTER COLUMN "title"       TYPE JSONB USING jsonb_build_object('pt-BR', "title",       'en', ''),
  ALTER COLUMN "description" TYPE JSONB USING jsonb_build_object('pt-BR', "description", 'en', '');
