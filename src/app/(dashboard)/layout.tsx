import Sidebar from "@/shared/components/layout/sidebar";
import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Superia",
  description: "Superia",
};

export default function SuperiaLayout({ children }: { children: React.ReactNode }) {
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
