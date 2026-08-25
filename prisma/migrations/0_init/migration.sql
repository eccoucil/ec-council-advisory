-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('MEMBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ReviewVote" AS ENUM ('YES', 'NO');

-- CreateEnum
CREATE TYPE "PulseQuestionType" AS ENUM ('LIKERT', 'YESNO', 'PMF', 'MULTI', 'TEXT', 'DUAL_TEXT');

-- CreateTable
CREATE TABLE "advisory_board_members" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisory_board_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_window" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "closedAt" TIMESTAMP(3),
    "closedBy" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_window_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenges" (
    "id" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "codeHash" TEXT NOT NULL,
    "emailSentTo" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_questions" (
    "id" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "sectionTitle" TEXT NOT NULL,
    "polarity" TEXT NOT NULL,
    "isGate" BOOLEAN NOT NULL DEFAULT false,
    "isRevised" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_answers" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "vote" "ReviewVote" NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_questions" (
    "id" TEXT NOT NULL,
    "section" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "type" "PulseQuestionType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "maxSelect" INTEGER,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_answers" (
    "id" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "commentText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pulse_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pulse_submissions" (
    "id" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pulse_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "advisory_board_members_email_key" ON "advisory_board_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "advisory_board_members_name_title_key" ON "advisory_board_members"("name", "title");

-- CreateIndex
CREATE INDEX "otp_challenges_memberId_createdAt_idx" ON "otp_challenges"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "review_answers_memberId_idx" ON "review_answers"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "review_answers_memberId_questionId_key" ON "review_answers"("memberId", "questionId");

-- CreateIndex
CREATE INDEX "pulse_questions_section_sortOrder_idx" ON "pulse_questions"("section", "sortOrder");

-- CreateIndex
CREATE INDEX "pulse_answers_memberId_idx" ON "pulse_answers"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_answers_memberId_questionId_key" ON "pulse_answers"("memberId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "pulse_submissions_memberId_key" ON "pulse_submissions"("memberId");

-- CreateIndex
CREATE INDEX "pulse_submissions_submittedAt_idx" ON "pulse_submissions"("submittedAt");

-- AddForeignKey
ALTER TABLE "otp_challenges" ADD CONSTRAINT "otp_challenges_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "advisory_board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answers" ADD CONSTRAINT "review_answers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "advisory_board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_answers" ADD CONSTRAINT "review_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "review_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_answers" ADD CONSTRAINT "pulse_answers_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "advisory_board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_answers" ADD CONSTRAINT "pulse_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "pulse_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pulse_submissions" ADD CONSTRAINT "pulse_submissions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "advisory_board_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

