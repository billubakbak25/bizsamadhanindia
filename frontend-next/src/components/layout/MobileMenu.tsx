"use client";

import { useState, Fragment } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  Phone,
  Wrench,
  Users,
  Mail,
  ArrowRight,
  Star,
} from "lucide-react";
import { MEGA_MENU_CATEGORIES, QUICK_LINKS, TRUST_STATS } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  Phone,
  Wrench,
  Users,
  Mail,
};

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-sm overflow-y-auto bg-white shadow-2xl lg:hidden"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
                <span className="font-semibold text-slate-900">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Trust badge */}
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.floor(TRUST_STATS.googleRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{TRUST_STATS.googleRating}</span>
                  <span className="text-xs text-slate-500">
                    ({TRUST_STATS.totalReviews.toLocaleString()}+ reviews)
                  </span>
                </div>
              </div>

              {/* Quick CTA */}
              <div className="border-b border-slate-100 p-4">
                <Link
                  href="/consultation"
                  onClick={() => setIsOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/15 transition hover:bg-[var(--brand-deep)]"
                >
                  <Phone className="h-4 w-4" />
                  Talk to Expert - Free Consultation
                </Link>
              </div>

              {/* Categories */}
              <nav className="px-4 py-4">
                <div className="space-y-1">
                  {MEGA_MENU_CATEGORIES.map((category) => {
                    const Icon = ICONS[category.icon] || Briefcase;
                    const isExpanded = expandedCategory === category.id;

                    return (
                      <Fragment key={category.id}>
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                            isExpanded ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              className={`h-5 w-5 ${isExpanded ? "text-[var(--brand)]" : "text-slate-400"}`}
                            />
                            <span
                              className={`font-medium ${isExpanded ? "text-[var(--brand)]" : "text-slate-900"}`}
                            >
                              {category.label}
                            </span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-8 space-y-1 pb-2 pt-1">
                                {category.items.map((item) => (
                                  <Link
                                    key={item.href + item.label}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between rounded-lg px-3 py-2.5 transition hover:bg-slate-50"
                                  >
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-700">{item.label}</span>
                                        {item.badge && (
                                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-700">
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                                      )}
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    );
                  })}
                </div>

                {/* Quick links */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Quick Links
                  </p>
                  <div className="space-y-1">
                    {QUICK_LINKS.map((link) => {
                      const Icon = ICONS[link.icon] || Mail;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                        >
                          <Icon className="h-5 w-5 text-slate-400" />
                          <span className="font-medium text-slate-700">{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Client Portal & Admin */}
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div className="space-y-2">
                    <Link
                      href="/client-portal"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Client Portal
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Admin Login
                    </Link>
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-lg lg:hidden">
      <div className="grid h-16 grid-cols-5 items-center">
        <Link
          href="/"
          className="flex flex-col items-center justify-center gap-1 py-2 text-slate-500 transition hover:text-slate-900"
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/services"
          className="flex flex-col items-center justify-center gap-1 py-2 text-slate-500 transition hover:text-slate-900"
        >
          <FileText className="h-5 w-5" />
          <span className="text-[10px] font-medium">Services</span>
        </Link>
        <Link
          href="/consultation"
          className="relative flex flex-col items-center justify-center"
        >
          <div className="absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg shadow-emerald-950/20">
            <Phone className="h-6 w-6" />
          </div>
          <span className="mt-8 text-[10px] font-medium text-[var(--brand)]">Consult</span>
        </Link>
        <Link
          href="/tools"
          className="flex flex-col items-center justify-center gap-1 py-2 text-slate-500 transition hover:text-slate-900"
        >
          <Wrench className="h-5 w-5" />
          <span className="text-[10px] font-medium">Tools</span>
        </Link>
        <Link
          href="/client-portal"
          className="flex flex-col items-center justify-center gap-1 py-2 text-slate-500 transition hover:text-slate-900"
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Portal</span>
        </Link>
      </div>
      {/* Safe area for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
