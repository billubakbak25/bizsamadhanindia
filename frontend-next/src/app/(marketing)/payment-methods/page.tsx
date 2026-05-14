import type { Metadata } from "next";
import Link from "next/link";
import { PaymentMethodsDirectory } from "@/components/sections/PaymentMethodsDirectory";
import { Card } from "@/components/ui/Card";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Payment Methods",
  description: "Supported Razorpay checkout payment methods, banks, UPI, wallets, EMI, Pay Later, and payment apps for BizSamadhan India.",
  alternates: {
    canonical: new URL("/payment-methods", SITE_URL).toString(),
  },
};

export default function PaymentMethodsPage() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-4">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-[var(--brand)]">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-900">Payment Methods</span>
          </nav>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-950 sm:text-5xl">Payment Methods</h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              BizSamadhan India accepts online payments through Razorpay Checkout with cards, UPI, netbanking, wallets, EMI, cardless EMI, Pay Later, and supported payment apps.
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {["All Razorpay default methods remain visible", "Live bank directory syncs from Razorpay", "Payments are verified before workflow handoff"].map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-medium text-slate-700">
                {highlight}
              </div>
            ))}
          </div>
        </Card>

        <PaymentMethodsDirectory />
      </div>
    </section>
  );
}
