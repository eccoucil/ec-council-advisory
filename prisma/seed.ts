import { Prisma, PrismaClient } from "../src/generated/prisma";
import { pulseQuestions } from "../src/lib/pulse-instrument";
import { reviewQuestions } from "./questions";

const prisma = new PrismaClient();

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

  const count = await prisma.advisoryBoardMember.count();
  const withEmail = await prisma.advisoryBoardMember.count({
    where: { email: { not: null } },
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

  const questionCount = await prisma.reviewQuestion.count();
  const pulseCount = await prisma.pulseQuestion.count();

  console.log(
    `Seeded ${count} advisory board members (${withEmail} with email), ${questionCount} review questions, and ${pulseCount} pulse questions.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
