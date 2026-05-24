-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "imageUrl" TEXT;
