import type { ReactNode } from "react";
import { AiAssistantWidget } from "@/components/ai/AiAssistantWidget";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileMenu";
import { FloatingWhatsApp, FloatingCallButton } from "@/components/StickyCTA";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Header />
      <main>{children}</main>
      <Footer />
      <AiAssistantWidget />
      <MobileBottomNav />
      <FloatingWhatsApp />
      <FloatingCallButton />
    </div>
  );
}
