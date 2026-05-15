-- CreateEnum
CREATE TYPE "TranslationStatus" AS ENUM ('draft', 'needs_translation', 'translated', 'reviewed');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "translationStatus" "TranslationStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "translationStatus" "TranslationStatus" NOT NULL DEFAULT 'draft';
