import { NextRequest, NextResponse } from "next/server";

export interface ResumeAnalysis {
  probability: number;
  strengths: string[];
  risks: string[];
  companyFit: {
    faang: number;
    unicorn: number;
    startup_seed: number;
  };
  recommendations: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    // Stub implementation - replace with actual LLM integration
    const analysis: ResumeAnalysis = {
      probability: 0.37 + Math.random() * 0.3, // Mock: 0.37-0.67
      strengths: [
        "Strong technical skills in modern frameworks",
        "Demonstrated project experience",
        "Clear communication in resume",
      ],
      risks: [
        "Limited work experience",
        "Gaps in specific domain knowledge",
      ],
      companyFit: {
        faang: 0.22 + Math.random() * 0.2,
        unicorn: 0.31 + Math.random() * 0.2,
        startup_seed: 0.66 + Math.random() * 0.2,
      },
      recommendations: [
        "Highlight specific achievements with metrics",
        "Add more detail about technical projects",
        "Consider adding relevant certifications",
      ],
    };

    // Normalize probabilities
    analysis.probability = Math.min(1, Math.max(0, analysis.probability));
    analysis.companyFit.faang = Math.min(1, Math.max(0, analysis.companyFit.faang));
    analysis.companyFit.unicorn = Math.min(1, Math.max(0, analysis.companyFit.unicorn));
    analysis.companyFit.startup_seed = Math.min(1, Math.max(0, analysis.companyFit.startup_seed));

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing resume:", error);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}

