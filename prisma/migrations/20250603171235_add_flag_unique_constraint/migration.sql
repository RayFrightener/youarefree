/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `Flag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Flag_userId_postId_key" ON "Flag"("userId", "postId");
