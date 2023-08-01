-- CreateTable
CREATE TABLE "Count" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "server" TEXT NOT NULL,
    "next" INTEGER NOT NULL,
    "broke" BOOLEAN NOT NULL,

    CONSTRAINT "Count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Afks" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "cooldown" INTEGER NOT NULL,
    "date" INTEGER NOT NULL,

    CONSTRAINT "Afks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stars" (
    "id" SERIAL NOT NULL,
    "messageid" TEXT NOT NULL,
    "embedid" TEXT NOT NULL,
    "messageChannelid" TEXT NOT NULL,

    CONSTRAINT "Stars_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Afks_user_key" ON "Afks"("user");

-- CreateIndex
CREATE UNIQUE INDEX "Stars_messageid_key" ON "Stars"("messageid");

-- CreateIndex
CREATE UNIQUE INDEX "Stars_embedid_key" ON "Stars"("embedid");
