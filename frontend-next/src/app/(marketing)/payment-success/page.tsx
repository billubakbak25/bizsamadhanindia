import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentStatusCard } from "@/components/forms/PaymentStatusCard";

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Review payment confirmation details after completing a BizSamadhan India checkout flow.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentSuccessPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading payment details...</div>}>
          <PaymentStatusCard />
        </Suspense>
      </div>
    </section>
  );
}