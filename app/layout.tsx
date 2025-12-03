import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { UserSidebar } from "@/components/UserSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TechOdds - Tech Job Prediction Market",
  description: "Predict tech job outcomes, hiring trends, and market signals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8">{children}</div>
          </main>
          <UserSidebar />
        </div>
      </body>
    </html>
  );
}

