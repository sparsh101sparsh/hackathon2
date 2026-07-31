import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  problemCount: number;
}

const TARGET_COMPANIES = [
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    logo: '🌐',
    description: 'Search, Cloud, AI, Android & Tech Innovations',
    problemCount: 45,
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    logo: '📦',
    description: 'E-Commerce, AWS Cloud Infrastructure & Logistics',
    problemCount: 52,
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    slug: 'microsoft',
    logo: '🪟',
    description: 'Windows OS, Azure Cloud, Developer Tools & AI',
    problemCount: 38,
  },
  {
    id: 'meta',
    name: 'Meta',
    slug: 'meta',
    logo: '♾️',
    description: 'Social Platforms, AR/VR, Distributed Infrastructure & AI',
    problemCount: 41,
  },
  {
    id: 'apple',
    name: 'Apple',
    slug: 'apple',
    logo: '🍎',
    description: 'Consumer Hardware, iOS Ecosystem, Metal & Services',
    problemCount: 29,
  },
  {
    id: 'netflix',
    name: 'Netflix',
    slug: 'netflix',
    logo: '🎬',
    description: 'Streaming Media, Recommendation Engines & Edge Services',
    problemCount: 24,
  },
  {
    id: 'uber',
    name: 'Uber',
    slug: 'uber',
    logo: '🚗',
    description: 'Global Ridesharing, Geospatial Indexing & Logistics AI',
    problemCount: 31,
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    slug: 'flipkart',
    logo: '🛒',
    description: 'E-Commerce, Supply Chain Management & High-QPS Microservices',
    problemCount: 22,
  },
];

export async function GET(req: NextRequest) {
  try {
    const dbCompanies = await prisma.company.findMany({
      include: {
        _count: {
          select: { companyProblems: true },
        },
      },
    });

    const dbMap = new Map(dbCompanies.map((c) => [c.name.toLowerCase(), c]));

    const companies: CompanySummary[] = TARGET_COMPANIES.map((seed) => {
      const dbComp = dbMap.get(seed.name.toLowerCase());
      const count = dbComp?._count.companyProblems || dbComp?.problemCount || seed.problemCount;
      return {
        id: dbComp?.id || seed.id,
        name: seed.name,
        slug: seed.slug,
        logo: seed.logo,
        description: dbComp?.description || seed.description,
        problemCount: count,
      };
    });

    return NextResponse.json({ companies });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in /api/company:', error);
    return NextResponse.json(
      { error: message || 'Failed to fetch company list' },
      { status: 500 }
    );
  }
}
