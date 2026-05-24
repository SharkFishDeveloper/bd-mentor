-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "comments" TEXT[],
ADD COLUMN     "mentoredId" TEXT[],
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "specializations" TEXT[],
ADD COLUMN     "university" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userMentored" INTEGER NOT NULL DEFAULT 0;
