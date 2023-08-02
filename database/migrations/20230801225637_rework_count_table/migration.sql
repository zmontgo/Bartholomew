/*
  Warnings:

  - You are about to drop the `Count` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Count";

-- CreateTable
CREATE TABLE "CountEntry" (
    "id" SERIAL NOT NULL,
    "entry_number" INTEGER NOT NULL,
    "entry_datetime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entry_user_id" TEXT NOT NULL,
    "entry_message_id" TEXT NOT NULL,
    "entry_guild_id" TEXT NOT NULL,
    "entry_next_number" INTEGER NOT NULL,
    "entry_broke_streak" BOOLEAN NOT NULL,

    CONSTRAINT "CountEntry_pkey" PRIMARY KEY ("id")
);
