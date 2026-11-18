-- CreateTable
CREATE TABLE "HackathonJudge" (
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "HackathonJudge_pkey" PRIMARY KEY ("hackathonId","userId")
);

-- AddForeignKey
ALTER TABLE "HackathonJudge" ADD CONSTRAINT "HackathonJudge_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonJudge" ADD CONSTRAINT "HackathonJudge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
