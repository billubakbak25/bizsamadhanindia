"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  ChevronDown,
  ArrowRight,
  Star,
  Phone,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Building2,
  FileCheck,
  Award,
  Users,
  BadgeCheck,
} from "lucide-react";
import { MEGA_MENU_CATEGORIES, TRUST_STATS, type MegaMenuCategory } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
};

// Quick access services for the "All Services" tab
const QUICK_ACCESS_SERVICES = [
  { 
    label: "Private Limited Company", 
    href: "/company-registration", 
    price: "6,999",
    icon: Building2,
    tag: "Most Popular",
    tagColor: "amber"
  },
  { 
    label: "GST Registration", 
    href: "/gst-registration", 
    price: "1,499",
    icon: FileCheck,
    tag: "Essential",
    tagColor: "emerald"
  },
  { 
    label: "Trademark Registration", 
    href: "/trademark-registration", 
    price: "1,999",
    icon: Shield,
    tag: "Protect Brand",
    tagColor: "blue"
  },
  { 
    label: "LLP Registration", 
    href: "/llp-registration", 
    price: "5,999",
    icon: Briefcase,
    tag: null,
    tagColor: null
  },
];

function AllServicesPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-950">Popular Services</h3>
        </div>
        
        {/* Quick access grid */}
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {QUICK_ACCESS_SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              onClick={onClose}
              className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 transition group-hover:bg-emerald-100">
                <service.icon className="h-6 w-6 text-[var(--brand)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{service.label}</span>
                  {service.tag && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      service.tagColor === "amber" ? "bg-amber-100 text-amber-700" :
                      service.tagColor === "emerald" ? "bg-emerald-100 text-emerald-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {service.tag}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--brand)]">Rs. {service.price}</span>
                  <span className="text-xs text-slate-400">onwards</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--brand)]" />
            </Link>
          ))}
        </div>

        {/* All categories */}
        <div className="border-t border-slate-100 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Browse by Category
          </p>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {MEGA_MENU_CATEGORIES.map((category) => {
              const Icon = ICONS[category.icon] || Briefcase;
              return (
                <Link
                  key={category.id}
                  href={category.items[0]?.href || "/services"}
                  onClick={onClose}
                  className="group flex items-center gap-2 rounded-xl p-2.5 transition hover:bg-slate-50"
                >
                  <Icon className="h-4 w-4 text-slate-400 transition group-hover:text-[var(--brand)]" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    {category.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Expert consultation CTA */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--brand)] to-teal-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-100">Need guidance?</p>
              <p className="font-semibold">Talk to an Expert</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-emerald-100">
            Get personalized advice from our CAs and lawyers
          </p>
          <Link
            href="/consultation"
            onClick={onClose}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-[var(--brand)] transition hover:bg-emerald-50"
          >
            Book Free Consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Stats card */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(TRUST_STATS.googleRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-bold text-slate-900">{TRUST_STATS.googleRating}</span>
            <span className="text-sm text-slate-500">on Google</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{TRUST_STATS.clientsServed.toLocaleString()}+</p>
              <p className="text-xs text-slate-500">Happy Customers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900">{TRUST_STATS.expertTeam}+</p>
              <p className="text-xs text-slate-500">Expert Team</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryPanel({ category, onClose }: { category: MegaMenuCategory; onClose: () => void }) {
  const Icon = ICONS[category.icon] || Briefcase;
  
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5 text-[var(--brand)]" />
          <h3 className="text-lg font-semibold text-slate-950">{category.label}</h3>
        </div>
        <p className="mb-6 text-sm text-slate-500">{category.description}</p>
        
        {/* Services grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {category.items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              onClick={onClose}
              className="group flex items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-slate-100 hover:bg-slate-50"
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 transition group-hover:bg-emerald-100">
                <CheckCircle2 className="h-4 w-4 text-[var(--brand)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 group-hover:text-[var(--brand)]">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      {item.badge}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                )}
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-200 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <Link
            href="/services"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] transition hover:text-[var(--brand-deep)]"
          >
            View all {category.label.toLowerCase()} services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Featured service */}
        {category.featured && (
          <Link
            href={category.featured.href}
            onClick={onClose}
            className="group block rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-5 transition hover:from-emerald-100 hover:to-teal-100"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Featured
              </p>
            </div>
            <h4 className="mt-2 font-semibold text-slate-900">{category.featured.title}</h4>
            <p className="mt-1 text-sm text-slate-600">{category.featured.description}</p>
            <div className="mt-3 flex items-center gap-1 text-sm font-medium text-[var(--brand)]">
              Learn more
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        )}

        {/* Quick stats */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(TRUST_STATS.googleRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200"
                  }`}
                />
              ))}
            </div>
            <span className="font-semibold text-slate-900">{TRUST_STATS.googleRating}</span>
            <span className="text-sm text-slate-500">Google Rating</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {TRUST_STATS.totalReviews.toLocaleString()}+ reviews |{" "}
            {TRUST_STATS.clientsServed.toLocaleString()}+ clients served
          </p>
        </div>

        {/* Need help card */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Need Help Choosing?</p>
          </div>
          <p className="mt-2 text-xs text-amber-700">
            Our experts can guide you to the right service
          </p>
          <Link
            href="/consultation"
            onClick={onClose}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 hover:text-amber-900"
          >
            Get free advice
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (categoryId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveCategory(categoryId);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 150);
  };

  const handleMenuMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const activeData = MEGA_MENU_CATEGORIES.find((cat) => cat.id === activeCategory);

  return (
    <nav aria-label="Primary navigation" className="relative hidden items-center lg:flex">
      <div className="flex items-center gap-0.5">
        {/* All Services button */}
        <button
          onMouseEnter={() => handleMouseEnter("all")}
          onMouseLeave={handleMouseLeave}
          className={`group flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
            activeCategory === "all"
              ? "bg-emerald-50 text-[var(--brand)]"
              : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>All Services</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              activeCategory === "all" ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Category buttons */}
        {MEGA_MENU_CATEGORIES.slice(0, 4).map((category) => {
          const Icon = ICONS[category.icon] || Briefcase;
          return (
            <button
              key={category.id}
              onMouseEnter={() => handleMouseEnter(category.id)}
              onMouseLeave={handleMouseLeave}
              className={`group flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? "bg-emerald-50 text-[var(--brand)]"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xl:inline">{category.label}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  activeCategory === category.id ? "rotate-180" : ""
                }`}
              />
            </button>
          );
        })}

        {/* More dropdown for remaining categories */}
        {MEGA_MENU_CATEGORIES.length > 4 && (
          <button
            onMouseEnter={() => handleMouseEnter(MEGA_MENU_CATEGORIES[4].id)}
            onMouseLeave={handleMouseLeave}
            className={`group flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
              activeCategory === MEGA_MENU_CATEGORIES[4]?.id
                ? "bg-emerald-50 text-[var(--brand)]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <span>More</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Talk to Expert CTA */}
        <Link
          href="/consultation"
          className="ml-2 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-amber-500/20 transition hover:shadow-md hover:shadow-amber-500/30"
        >
          <Phone className="h-4 w-4" />
          <span>Talk to Expert</span>
        </Link>
      </div>

      {/* Mega menu dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="fixed left-0 right-0 top-[108px] z-50 border-b border-slate-200 bg-white shadow-xl shadow-slate-900/5"
          >
            <div className="mx-auto max-w-7xl px-6 py-6">
              {activeCategory === "all" ? (
                <AllServicesPanel onClose={handleClose} />
              ) : activeData ? (
                <CategoryPanel category={activeData} onClose={handleClose} />
              ) : null}
            </div>

            {/* Bottom trust bar */}
            <div className="border-t border-slate-100 bg-slate-50">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BadgeCheck className="h-4 w-4 text-emerald-500" />
                    <span>Government Registered</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-emerald-500" />
                    <span>30-min Expert Callback</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>100% Secure & Confidential</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Need help?</span>
                  <a href="tel:+919876543210" className="font-semibold text-[var(--brand)]">
                    +91 98765 43210
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
