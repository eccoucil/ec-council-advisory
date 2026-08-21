import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const ADMIN_NAME = "EC-Council Administrator";
const ADMIN_TITLE = "Platform Administrator";

const members: Array<{ name: string; title: string; email: string | null }> = [
  {
    name: "Aaron Stark",
    title: "Head of AI Developer Platform Solutions & Agentic DevOps (DX)",
    email: null,
  },
  {
    name: "Chandra Donelson",
    title: "Strategic Advisor for HR IT Modernization, Analytics, and AI",
    email: null,
  },
  {
    name: "Anish Mitra",
    title: "Director",
    email: null,
  },
  {
    name: "Lewis V. Adams",
    title: "Vice President | Enterprise AI & Capital Productivity Transformation",
    email: null,
  },
  {
    name: "Kathy Baxter",
    title: "VP / Principal Architect, Responsible AI & Tech",
    email: null,
  },
  {
    name: "ShanShan Pa",
    title: "Global Head of AI & Data Governance",
    email: null,
  },
  {
    name: "Edoardo Tealdi",
    title:
      "Executive Head of AI Transformation - Business Engagement and Growth Units",
    email: null,
  },
  {
    name: "Raji Bhimireddy",
    title: "Vice President Cloud, AI, Architecture, FInOps & Business Value",
    email: null,
  },
  {
    name: "Jaya Kandaswamy",
    title: "Senior Vice President, Product, AI, and Innovation",
    email: null,
  },
  {
    name: "Vasant J Chandra",
    title: "Vice President, Agentic Advisory",
    email: null,
  },
  {
    name: "Adam Spearing",
    title: "VP of AI GTM EMEA",
    email: null,
  },
  {
    name: "George Nassar",
    title: "Principal Consultant",
    email: null,
  },
  {
    name: "Anita Lacea",
    title: "Head of AI Transformation, Azure Hardware Infrastructure",
    email: null,
  },
  {
    name: "Pavan Kristipati",
    title:
      "Head of AI Engineering & Transformation (SVP Scope) | Enterprise AI Adoption, Governance & Platform",
    email: null,
  },
  {
    name: "Mark Ritcey",
    title: "Vice President, AI & Automation Delivery",
    email: null,
  },
  {
    name: "Sophia Katrenko",
    title: "VP of AI/ML",
    email: null,
  },
  {
    name: "Andrei Son",
    title: "Head of AI Transformation",
    email: null,
  },
  {
    name: "Madhur Mayank Sharma",
    title:
      "Vice President, AI Product Engineering & Global Head of AI Services & Accelerator",
    email: null,
  },
  {
    name: "Dr. Sayed Peerzade",
    title: "Executive Vice President - Cloud, AI & Government Initiatives",
    email: null,
  },
  {
    name: "Naveen Upadhyay",
    title:
      "Vice President, AI/ML Product Management – Machine Learning & Intelligence Operations",
    email: null,
  },
  {
    name: "Vineet Gandhi",
    title: "Group Vice President - AI Product Management",
    email: null,
  },
  {
    name: "Yashwinder Chhikara",
    title: "Sr. Vice President - AI, Analytics, and Product Management",
    email: null,
  },
  {
    name: "Parikshit Nag",
    title: "Group Head of Artificial Intelligence & Machine Learning",
    email: null,
  },
  {
    name: "Mohsin Khan",
    title: "Head of AI & Automation Hub",
    email: null,
  },
  {
    name: "Jami Kiran",
    title: "Executive Vice President- Innovation & Transformation",
    email: null,
  },
  {
    name: "Sudarson Roy Pratihar",
    title: "Founder and Principal",
    email: null,
  },
  {
    name: "Sanjoy K Saha",
    title: "Head of AI Portfolio and Governance & Chief of Staff CDAO",
    email: null,
  },
  {
    name: "Raghunandan Mishra",
    title: "Vice President, Agentic AI Platform Engineering",
    email: null,
  },
  {
    name: "Lily Rachmawati",
    title: "Director, Head of Applied AI",
    email: null,
  },
  {
    name: "Dinesh Bhogle",
    title: "Head of AI/ML platform",
    email: null,
  },
  {
    name: "Pandiyan Adiyapatham",
    title: "Head of Generative AI, Cognizant Bluebolt, BU CIO, P&L Head",
    email: null,
  },
  {
    name: "Karthik S.",
    title: "AI Practice Lead",
    email: null,
  },
  {
    name: "Malik Hussain",
    title: "AI Enablement Lead, Data & AI Academy",
    email: null,
  },
  {
    name: "Oscar Jarabo",
    title: "Global Head of AI Product & Strategy",
    email: null,
  },
  {
    name: "Dr Vinod Ebinezer",
    title: "Head of Explainable AI & Automation",
    email: null,
  },
  {
    name: "Sruthi Pakanati",
    title: "Head of AI & Data Transformation, National Quality & Risk",
    email: null,
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

  console.log(
    `Seeded ${count} advisory board members (${withEmail} with email).`,
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
