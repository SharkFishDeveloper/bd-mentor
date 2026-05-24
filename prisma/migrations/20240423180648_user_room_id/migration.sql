/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "roomId" TEXT[],
ADD COLUMN     "usersName" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roomId" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
