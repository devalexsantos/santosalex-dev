-- Convert the (sourceType, sourceId) index into a unique constraint that also
-- includes locale, so AiDocument rows mirrored from Project/Post can be upserted
-- safely without race conditions.

DROP INDEX IF EXISTS "AiDocument_sourceType_sourceId_idx";

CREATE UNIQUE INDEX "AiDocument_sourceType_sourceId_locale_key"
  ON "AiDocument" ("sourceType", "sourceId", "locale");
