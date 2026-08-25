import { Prisma, PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/lib/password";
import { pulseQuestions } from "../src/lib/pulse-instrument";
import { PULSE_WINDOW_ID } from "../src/lib/pulse-window";
import { reviewQuestions } from "./questions";

const prisma = new PrismaClient();

const ADMIN_NAME = "EC-Council Administrator";
const ADMIN_TITLE = "Platform Administrator";

const members: Array<{ name: string; title: string; email: string | null }> = [
  {
    name: "Aaron Stark",
    title: "Head of AI Developer Platform Solutions & Agentic DevOps (DX)",
    email: "aaronstark@microsoft.com",
  },
  {
    name: "Chandra Donelson",
    title: "Strategic Advisor for HR IT Modernization, Analytics, and AI",
    email: "contact@thedatadetective.org",
  },
  {
    name: "Anish Mitra",
    title: "Director",
    email: "anishmitra@kpmg.com",
  },
  {
    name: "Lewis V. Adams",
    title: "Vice President | Enterprise AI & Capital Productivity Transformation",
    email: "ladams@lewisvadams.com",
  },
  {
    name: "Kathy Baxter",
    title: "VP / Principal Architect, Responsible AI & Tech",
    email: "kbaxter@salesforce.com",
  },
  {
    name: "ShanShan Pa",
    title: "Global Head of AI & Data Governance",
    email: "shanshan.pa@globallogic.com",
  },
  {
    name: "Edoardo Tealdi",
    title: "Executive Head of AI Transformation - Business Engagement and Growth Units",
    email: "edoardo.tealdi@nttdata.com",
  },
  {
    name: "Raji Bhimireddy",
    title: "Vice President Cloud, AI, Architecture, FInOps & Business Value",
    email: "bheemireddi@gmail.com",
  },
  {
    name: "Jaya Kandaswamy",
    title: "Senior Vice President, Product, AI, and Innovation",
    email: "jkandas@gmail.com",
  },
  {
    name: "Vasant J Chandra",
    title: "Vice President, Agentic Advisory",
    email: "vasantjchandra@gmail.com",
  },
  {
    name: "Adam Spearing",
    title: "VP of AI GTM EMEA",
    email: "adam.spearing@servicenow.com",
  },
  {
    name: "George Nassar",
    title: "Principal Consultant",
    email: "g_nassar@yahoo.com",
  },
  {
    name: "Anita Lacea",
    title: "Head of AI Transformation, Azure Hardware Infrastructure",
    email: "alacea@gmail.com",
  },
  {
    name: "Pavan Kristipati",
    title: "Head of AI Engineering & Transformation (SVP Scope) | Enterprise AI Adoption, Governance & Platform",
    email: "pavan.kristipati@gmail.com",
  },
  {
    name: "Mark Ritcey",
    title: "Vice President, AI & Automation Delivery",
    email: "mritcey@outlook.com",
  },
  {
    name: "Sophia Katrenko",
    title: "VP of AI/ML",
    email: "sophia.katrenko@gmail.com",
  },
  {
    name: "Andrei Son",
    title: "Head of AI Transformation",
    email: "andrei.son@aumovio.com",
  },
  {
    name: "Madhur Mayank Sharma",
    title: "Vice President, AI Product Engineering & Global Head of AI Services & Accelerator",
    email: "madhur.mayank@gmail.com",
  },
  {
    name: "Dr. Sayed Peerzade",
    title: "Executive Vice President - Cloud, AI & Government Initiatives",
    email: "sayed1.peerzade@ril.com",
  },
  {
    name: "Naveen Upadhyay",
    title: "Vice President, AI/ML Product Management – Machine Learning & Intelligence Operations",
    email: "naveen21u@gmail.com",
  },
  {
    name: "Vineet Gandhi",
    title: "Group Vice President - AI Product Management",
    email: "vineetgandhi@gmail.com",
  },
  {
    name: "Yashwinder Chhikara",
    title: "Sr. Vice President - AI, Analytics, and Product Management",
    email: "yashwinder.chhikara@isonxperiences.com",
  },
  {
    name: "Parikshit Nag",
    title: "Group Head of Artificial Intelligence & Machine Learning",
    email: "parikshitnag@live.com",
  },
  {
    name: "Mohsin Khan",
    title: "Head of AI & Automation Hub",
    email: "messagemohsin@gmail.com",
  },
  {
    name: "Jami Kiran",
    title: "Executive Vice President- Innovation & Transformation",
    email: "jklife2010@gmail.com",
  },
  {
    name: "Sudarson Roy Pratihar",
    title: "Founder and Principal",
    email: "sudarson@a2iqx.com",
  },
  {
    name: "Sanjoy K Saha",
    title: "Head of AI Portfolio and Governance & Chief of Staff CDAO",
    email: "sanjoysaha70@gmail.com",
  },
  {
    name: "Raghunandan Mishra",
    title: "Vice President, Agentic AI Platform Engineering",
    email: "raghumish@gmail.com",
  },
  {
    name: "Lily Rachmawati",
    title: "Director, Head of Applied AI",
    email: "rachmawati.lily@gmail.com",
  },
  {
    name: "Dinesh Bhogle",
    title: "Head of AI/ML platform",
    email: "bhogled@bv.com",
  },
  {
    name: "Pandiyan Adiyapatham",
    title: "Head of Generative AI, Cognizant Bluebolt, BU CIO, P&L Head",
    email: "pandiyan.adiyapatham@gmail.com",
  },
  {
    name: "Karthik Raghuram Sundar",
    title: "AI Practice Lead",
    email: "karthik.sundar@eccouncil.org",
  },
  {
    name: "Malik Hussain",
    title: "AI Enablement Lead, Data & AI Academy",
    email: "malik_hussain@mail.harvard.edu",
  },
  {
    name: "Oscar Jarabo",
    title: "Global Head of AI Product & Strategy",
    email: "ojarabo@proton.me",
  },
  {
    name: "Dr Vinod Ebinezer",
    title: "Head of Explainable AI & Automation",
    email: "vinod.ebinezer@qdtanalytics.com",
  },
  {
    name: "Viknesh Krishnan",
    title: "Advisory Board Member",
    email: "viknesh.krishnan@eccouncil.org",
  },
];

/**
 * Seeds the administrator from the environment so no credential is committed.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env; re-running resets the password.
 */
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "Skipped the admin account: set ADMIN_EMAIL and ADMIN_PASSWORD to seed it.",
    );
    return;
  }

  const passwordHash = await hashPassword(password);
  const admin = await prisma.advisoryBoardMember.upsert({
    where: { email },
    create: {
      name: ADMIN_NAME,
      title: ADMIN_TITLE,
      email,
      role: "ADMIN",
      passwordHash,
    },
    update: { role: "ADMIN", passwordHash },
    select: { email: true },
  });

  console.log(`Admin account ready: ${admin.email}`);
}

async function main() {
  for (const member of members) {
    await prisma.advisoryBoardMember.upsert({
      where: {
        name_title: {
          name: member.name,
          title: member.title,
        },
      },
      create: member,
      update: {
        title: member.title,
        ...(member.email ? { email: member.email } : {}),
      },
    });
  }

  const count = await prisma.advisoryBoardMember.count({
    where: { role: "MEMBER" },
  });
  const withEmail = await prisma.advisoryBoardMember.count({
    where: { role: "MEMBER", email: { not: null } },
  });

  for (const question of reviewQuestions) {
    await prisma.reviewQuestion.upsert({
      where: { id: question.id },
      create: question,
      update: {
        section: question.section,
        sectionTitle: question.sectionTitle,
        polarity: question.polarity,
        isGate: question.isGate,
        isRevised: question.isRevised,
        prompt: question.prompt,
        basis: question.basis,
      },
    });
  }

  for (const question of pulseQuestions) {
    await prisma.pulseQuestion.upsert({
      where: { id: question.id },
      create: {
        id: question.id,
        section: question.section,
        code: question.code,
        sortOrder: question.sortOrder,
        type: question.type,
        prompt: question.prompt,
        required: question.required,
        maxSelect: question.maxSelect ?? null,
        options: question.options ?? Prisma.DbNull,
      },
      update: {
        section: question.section,
        code: question.code,
        sortOrder: question.sortOrder,
        type: question.type,
        prompt: question.prompt,
        required: question.required,
        maxSelect: question.maxSelect ?? null,
        options: question.options ?? Prisma.DbNull,
      },
    });
  }

  // The singleton that records a manual close. `update: {}` is deliberate: a
  // re-seed must never reopen a window an administrator has already closed.
  await prisma.pulseWindow.upsert({
    where: { id: PULSE_WINDOW_ID },
    create: { id: PULSE_WINDOW_ID, closedAt: null, closedBy: null },
    update: {},
  });

  const questionCount = await prisma.reviewQuestion.count();
  const pulseCount = await prisma.pulseQuestion.count();
  const window = await prisma.pulseWindow.findUnique({
    where: { id: PULSE_WINDOW_ID },
    select: { closedAt: true },
  });

  console.log(
    `Seeded ${count} advisory board members (${withEmail} with email), ${questionCount} review questions, and ${pulseCount} pulse questions.`,
  );
  console.log(
    `Pulse window: ${window?.closedAt ? `closed ${window.closedAt.toISOString()}` : "open"}.`,
  );

  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
