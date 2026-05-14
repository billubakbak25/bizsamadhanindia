"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  CheckCircle2,
  Phone,
  ArrowRight,
  Play,
  Shield,
  Users,
  Award,
  BadgeCheck,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Building2,
  FileCheck,
  IndianRupee,
} from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { BUSINESS_CONTACT, TRUST_STATS } from "@/lib/constants";

// Animated counter with easing
function AnimatedCounter({ value, suffix = "", prefix = "" }: { value: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}{count.toLocaleString("en-IN")}{suffix}
    </span>
  );
}

// Rotating text animation for hero headline
const ROTATING_WORDS = [
  { text: "Company Registration", icon: Building2 },
  { text: "GST Filing", icon: FileCheck },
  { text: "Trademark Protection", icon: Shield },
  { text: "Tax Compliance", icon: IndianRupee },
];

function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ROTATING_WORDS[index];

  return (
    <span className="relative inline-flex min-w-[280px] items-center justify-start sm:min-w-[320px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={current.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-[var(--brand)]"
        >
          <current.icon className="h-8 w-8 sm:h-10 sm:w-10" />
          {current.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Trust badges with micro-interactions
function TrustBadges() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap items-center gap-2 sm:gap-3"
    >
      {/* Google Rating */}
      <div className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-amber-200 hover:shadow-md">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
                i < Math.floor(TRUST_STATS.googleRating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-slate-200 text-slate-200"
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-bold text-slate-900">{TRUST_STATS.googleRating}</span>
        <div className="flex items-center gap-1">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-xs text-slate-500">Rating</span>
        </div>
      </div>

      {/* Reviews Count */}
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:shadow-md">
        <Users className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-semibold text-slate-700">
          {TRUST_STATS.totalReviews.toLocaleString("en-IN")}+
        </span>
        <span className="text-xs text-slate-500">Reviews</span>
      </div>

      {/* ISO Badge */}
      <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 sm:flex">
        <BadgeCheck className="h-4 w-4 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">ISO 9001:2015</span>
      </div>

      {/* Years Badge */}
      <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-2">
        <Award className="h-4 w-4 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">Since 2019</span>
      </div>
    </motion.div>
  );
}

// Stats grid with enhanced visuals
function StatsGrid() {
  const stats = [
    { 
      icon: Users, 
      value: TRUST_STATS.clientsServed, 
      suffix: "+", 
      label: "Happy Customers",
      color: "emerald",
      description: "Businesses registered"
    },
    { 
      icon: Shield, 
      value: TRUST_STATS.expertTeam, 
      suffix: "+", 
      label: "Expert CAs & Lawyers",
      color: "blue",
      description: "Licensed professionals"
    },
    { 
      icon: TrendingUp, 
      value: 98, 
      suffix: "%", 
      label: "Success Rate",
      color: "amber",
      description: "Application approval"
    },
  ];

  const colorClasses = {
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid gap-3 sm:grid-cols-3"
    >
      {stats.map((stat, index) => {
        const colors = colorClasses[stat.color as keyof typeof colorClasses];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="group"
          >
            <div className={`flex items-center gap-3 rounded-2xl border ${colors.border} bg-white p-4 shadow-sm transition hover:shadow-md`}>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bg}`}>
                <stat.icon className={`h-6 w-6 ${colors.icon}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-950">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm font-medium text-slate-700">{stat.label}</p>
                <p className="text-xs text-slate-400">{stat.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Quick services with pricing hints
function QuickServices() {
  const services = [
    { label: "Pvt Ltd Company", href: "/company-registration", price: "6,999", badge: "Popular" },
    { label: "GST Registration", href: "/gst-registration", price: "1,499", badge: null },
    { label: "Trademark", href: "/trademark-registration", price: "1,999", badge: "Fast" },
    { label: "LLP Registration", href: "/llp-registration", price: "5,999", badge: null },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-3"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Most Popular Services
      </p>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-[var(--brand)] hover:shadow-md"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>{service.label}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 transition group-hover:bg-emerald-100 group-hover:text-emerald-700">
              Rs. {service.price}
            </span>
            {service.badge && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-700">
                {service.badge}
              </span>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[var(--brand)]" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// Enhanced lead capture form with multi-step option
function HeroForm() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <LeadCaptureForm
        title="Free Expert Consultation"
        description="Share your requirement once. It goes into CRM, WhatsApp follow-up, and the service workflow."
        defaultService="company_registration"
        defaultCity="Kanpur"
        leadEndpoint="/api/crm/leads"
        trackingContext="homepage_hero"
        placement="homepage_hero_form"
      />
    </motion.div>
  );
}

// WhatsApp floating button
function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${BUSINESS_CONTACT.whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20business%20registration`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition hover:scale-110 hover:bg-green-600 lg:hidden"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </motion.a>
  );
}

// Video testimonial badge
function VideoTestimonialBadge() {
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="group mt-4 flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:shadow-md"
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <Play className="h-4 w-4 fill-red-600 text-red-600" />
        <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-red-500" />
      </div>
      <div className="text-left">
        <p className="text-sm font-semibold text-slate-900">Watch Customer Stories</p>
        <p className="text-xs text-slate-500">See why 50,000+ trust us</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500" />
    </motion.button>
  );
}

export function Hero() {
  return (
    <>
      <section className="hero-shell relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-12">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-start lg:gap-12">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <Play className="h-3 w-3 fill-emerald-600 text-emerald-600" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                India&apos;s #1 Legal Services Platform
              </span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            </motion.div>

            {/* Main headline with rotating text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h1 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl xl:text-[3.5rem] xl:leading-[1.1]">
                Expert Help for{" "}
                <RotatingText />
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                From company registration to tax filing, we make legal services 
                <span className="font-semibold text-slate-800"> simple, affordable, and accessible </span> 
                for entrepreneurs across India.
              </p>
            </motion.div>

            {/* Trust badges */}
            <TrustBadges />

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link 
                href="/consultation" 
                className={buttonClassName({ size: "lg", className: "justify-center gap-2" })}
              >
                <Phone className="h-4 w-4" />
                Get Free Consultation
              </Link>
              <Link 
                href="/services" 
                className={buttonClassName({ variant: "secondary", size: "lg", className: "justify-center gap-2" })}
              >
                Explore All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Video testimonial badge */}
            <VideoTestimonialBadge />

            {/* Stats grid */}
            <StatsGrid />

            {/* Quick services */}
            <QuickServices />
          </div>

          {/* Right - Lead Form */}
          <div className="lg:sticky lg:top-28">
            <HeroForm />
          </div>
        </div>
      </section>

      {/* WhatsApp button for mobile */}
      <WhatsAppButton />
    </>
  );
}
