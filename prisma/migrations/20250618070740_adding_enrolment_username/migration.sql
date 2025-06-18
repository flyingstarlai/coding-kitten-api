/*
  Warnings:

  - A unique constraint covering the columns `[classroomId,username]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classroomId_username_key" ON "Enrollment"("classroomId", "username");
