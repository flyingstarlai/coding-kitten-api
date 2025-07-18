/*
  Warnings:

  - You are about to drop the column `code` on the `Classroom` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[room]` on the table `Classroom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `room` to the `Classroom` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Classroom_code_key";

-- AlterTable
ALTER TABLE "Classroom" DROP COLUMN "code",
ADD COLUMN     "room" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_room_key" ON "Classroom"("room");
