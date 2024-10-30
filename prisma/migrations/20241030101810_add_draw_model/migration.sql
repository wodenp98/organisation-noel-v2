-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "gen" INTEGER NOT NULL,
    "isRevealed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giverId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Draw_giverId_gen_key" ON "Draw"("giverId", "gen");

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_giverId_fkey" FOREIGN KEY ("giverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Draw" ADD CONSTRAINT "Draw_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
