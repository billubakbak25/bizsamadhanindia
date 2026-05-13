"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MEGA_MENU_CATEGORIES, TRUST_STATS } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  "start-business": {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
  },
  "tax-compliance": {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
  },
  "trademark-ip": {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
  },
  accounting: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
  },
  legal: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    iconBg: "bg-rose-100",
  },
};

function CategoryCard({
  category,
  index,
}: {
  category: (typeof MEGA_MENU_CATEGORIES)[0];
  index: number;
}) {
  const Icon = ICONS[category.icon] || Briefcase;
  const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS["start-business"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group h-full overflow-hidden transition hover:shadow-xl">
        <div className={`${colors.bg} px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.iconBg}`}>
              <Icon className={`h-6 w-6 ${colors.text}`} />
            </div>
            <span className={`rounded-full ${colors.bg} ${colors.border} border px-3 py-1 text-xs font-semibold ${colors.text}`}>
              {category.items.length} Services
            </span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-950">{category.label}</h3>
          <p className="mt-1 text-sm text-slate-600">{category.description}</p>
        </div>

        <div className="p-6">
          <div className="space-y-2">
            {category.items.slice(0, 4).map((item) => (
              <Link
                key={item.href + item.label}
                href={item.href}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-700">
                      {item.badge}
                    </span>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-500" />
              </Link>
            ))}
          </div>

          {category.items.length > 4 && (
            <Link
              href="/services"
              className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${colors.text} transition hover:underline`}
            >
              View all {category.items.length} services
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

function TrustSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="grid gap-6 p-8 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4 text-white">
            <h3 className="text-2xl font-bold">Why businesses trust us</h3>
            <p className="text-emerald-100">
              We combine technology with expert legal support to deliver fast, reliable, and
              affordable services across India.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">{TRUST_STATS.clientsServed.toLocaleString()}+ Clients</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
                <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                <span className="text-sm font-medium">99% Success Rate</span>
              </div>
            </div>
            <Link
              href="/consultation"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:bg-emerald-50"
            >
              Talk to an Expert
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Google Rating", value: `${TRUST_STATS.googleRating}/5` },
              { label: "Expert Team", value: `${TRUST_STATS.expertTeam}+` },
              { label: "Years Experience", value: `${TRUST_STATS.yearsExperience}+` },
              { label: "Reviews", value: `${(TRUST_STATS.totalReviews / 1000).toFixed(0)}K+` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 px-4 py-4 text-center backdrop-blur"
              >
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-xs text-emerald-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function ServiceCategories() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl space-y-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[var(--brand)]">
            Our Services
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Complete legal and compliance solutions for your business
          </h2>
          <p className="text-base leading-relaxed text-slate-600">
            From starting a company to protecting your brand, managing taxes, and staying compliant
            - we&apos;ve got you covered with expert support at every step.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MEGA_MENU_CATEGORIES.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        <TrustSection />
      </div>
    </section>
  );
}
