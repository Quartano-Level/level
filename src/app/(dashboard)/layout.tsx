import Sidebar from "@/shared/components/layout/sidebar";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Level",
  description: "Level",
};

export default function LevelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
        <Sidebar />
        <main className="flex-1">
            {children}
        </main>
        <Toaster position="top-right" />
    </div>
  );
}
