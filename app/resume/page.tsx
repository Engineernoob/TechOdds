"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import type { ResumeAnalysis } from "@/app/api/ai/resume-analyze/route";

export default function ResumePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please enter resume text");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/resume-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      if (!res.ok) {
        throw new Error("Analysis failed");
      }

      const data = await res.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      alert("Failed to analyze resume");
    } finally {
      setLoading(false);
    }
  };

  const handleMintFuture = () => {
    // Navigate to create future with pre-filled data
    router.push(
      `/futures/create?title=${encodeURIComponent(
        `Will I get an offer? (${(analysis!.probability * 100).toFixed(0)}% odds)`
      )}`
    );
  };

  const companyFitData = analysis
    ? [
        { name: "FAANG", value: analysis.companyFit.faang * 100 },
        { name: "Unicorn", value: analysis.companyFit.unicorn * 100 },
        { name: "Startup", value: analysis.companyFit.startup_seed * 100 },
      ]
    : [];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Resume Odds Engine</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>Paste your resume text to analyze hire probability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              className="w-full h-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Hire Probability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold mb-4">
                  {(analysis.probability * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-muted h-4 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: `${analysis.probability * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Fit</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={companyFitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.strengths.map((strength, i) => (
                    <Badge key={i} variant="secondary">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.risks.map((risk, i) => (
                    <Badge key={i} variant="destructive">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button onClick={handleMintFuture} className="w-full">
              Mint Future Market from Resume Odds
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

