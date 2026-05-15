-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "tagline" JSONB NOT NULL,
    "bio" JSONB NOT NULL,
    "approach" JSONB NOT NULL,
    "location" TEXT,
    "availability" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileRoleType" (
    "id" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileRoleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileExperience" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" JSONB NOT NULL,
    "period" TEXT NOT NULL,
    "highlights" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileFaq" (
    "id" TEXT NOT NULL,
    "question" JSONB NOT NULL,
    "answer" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileFaq_pkey" PRIMARY KEY ("id")
);
