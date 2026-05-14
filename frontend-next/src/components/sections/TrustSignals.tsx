"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Award,
  Shield,
  CheckCircle2,
  Building2,
  BadgeCheck,
  Clock,
  TrendingUp,
  Quote,
  ArrowRight,
  Play,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { TRUST_STATS, TESTIMONIALS } from "@/lib/constants";

// Animated counter
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

// Google rating badge
export function GoogleRatingBadge({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    default: "px-4 py-2 text-sm",
    large: "px-5 py-3 text-base",
  };

  const starSize = {
    small: "h-3 w-3",
    default: "h-4 w-4",
    large: "h-5 w-5",
  };

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white shadow-sm ${sizeClasses[size]}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize[size]} ${
              i < Math.floor(TRUST_STATS.googleRating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="font-bold text-slate-900">{TRUST_STATS.googleRating}</span>
      <div className="flex items-center gap-1.5">
        <svg className={starSize[size]} viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span className="text-slate-500">Rating</span>
      </div>
    </div>
  );
}

// Trust badges section
export function TrustBadgesSection() {
  const badges = [
    { icon: BadgeCheck, label: "Government Registered", color: "emerald" },
    { icon: Shield, label: "100% Secure & Confidential", color: "blue" },
    { icon: Award, label: "ISO 9001:2015 Certified", color: "amber" },
    { icon: Clock, label: "30-min Expert Callback", color: "purple" },
  ];

  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {badges.map((badge) => {
        const colors = colorClasses[badge.color as keyof typeof colorClasses];
        return (
          <div
            key={badge.label}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${colors}`}
          >
            <badge.icon className="h-4 w-4" />
            {badge.label}
          </div>
        );
      })}
    </div>
  );
}

// Stats grid section
export function StatsSection() {
  const stats = [
    { 
      icon: Users, 
      value: TRUST_STATS.clientsServed, 
      suffix: "+", 
      label: "Happy Customers",
      description: "Businesses registered",
      color: "emerald"
    },
    { 
      icon: Star, 
      value: TRUST_STATS.googleRating, 
      suffix: "", 
      label: "Google Rating",
      description: `Based on ${TRUST_STATS.totalReviews.toLocaleString()}+ reviews`,
      color: "amber"
    },
    { 
      icon: Award, 
      value: TRUST_STATS.yearsExperience, 
      suffix: "+", 
      label: "Years Experience",
      description: "Trusted since 2019",
      color: "blue"
    },
    { 
      icon: TrendingUp, 
      value: 98, 
      suffix: "%", 
      label: "Success Rate",
      description: "Application approval",
      color: "purple"
    },
  ];

  const colorClasses = {
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-100" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-100" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-100" },
  };

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">Trusted by 50,000+ Businesses</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Join thousands of entrepreneurs who chose us for their business registration and compliance needs
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const colors = colorClasses[stat.color as keyof typeof colorClasses];
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="relative overflow-hidden p-6 text-center">
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg}`}>
                    <stat.icon className={`h-7 w-7 ${colors.icon}`} />
                  </div>
                  <div className="mt-4 text-4xl font-bold text-slate-950">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700">{stat.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Testimonials section with carousel
export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Wadhwani Associates made company registration incredibly simple. The team guided us through every step.",
      author: "Rahul Sharma",
      role: "Founder, TechStart India",
      rating: 5,
      service: "Company Registration"
    },
    {
      quote: "Got my trademark registered in record time. Professional service and great communication throughout.",
      author: "Priya Patel",
      role: "CEO, DesignHub",
      rating: 5,
      service: "Trademark Registration"
    },
    {
      quote: "Their GST filing service saved us hours every month. Highly recommended for startups.",
      author: "Amit Kumar",
      role: "Finance Head, GrowFast",
      rating: 5,
      service: "GST Filing"
    },
    ...TESTIMONIALS.map((t, i) => ({
      quote: t.quote,
      author: t.author,
      role: "Business Owner",
      rating: 5,
      service: ["Company Registration", "GST Filing", "Trademark"][i % 3]
    }))
  ];

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
          <div>
            <h2 className="text-3xl font-bold text-slate-950 sm:text-4xl">What Our Customers Say</h2>
            <p className="mt-2 text-lg text-slate-600">Real reviews from real business owners</p>
          </div>
          <GoogleRatingBadge size="large" />
        </div>
        
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="flex h-full flex-col p-6">
                <div className="flex items-center gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="mt-4 flex-1">
                  <Quote className="h-8 w-8 text-emerald-100" />
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{testimonial.quote}</p>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="font-semibold text-slate-900">{testimonial.author}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                  <span className="mt-2 inline-block rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    {testimonial.service}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:underline"
          >
            Read more reviews
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Partner/Client logos section
export function ClientLogosSection() {
  const partners = [
    "10,000+ Startups",
    "5,000+ SMEs", 
    "500+ CA Firms",
    "100+ Law Firms",
    "50+ Tech Companies",
    "30+ Cities Covered"
  ];

  return (
    <section className="border-y border-slate-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-400">
          Trusted by businesses across India
        </p>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner}
              className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"
            >
              <Building2 className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm font-semibold text-slate-700">{partner}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Video testimonial CTA
export function VideoTestimonialCTA() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 lg:p-12">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="relative grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white">
                <Play className="h-4 w-4 fill-current" />
                Customer Stories
              </span>
              <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
                See How We Help Businesses Grow
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Watch real success stories from entrepreneurs who trusted us with their 
                business registration and compliance needs.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-emerald-50">
                  <Play className="h-5 w-5 fill-current" />
                  Watch Video Stories
                </button>
                <Link
                  href="/consultation"
                  className="flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Get Started Today
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl bg-slate-800">
                <div className="flex h-full items-center justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30">
                    <Play className="h-10 w-10 fill-white text-white" />
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 rounded-2xl bg-white p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">{TRUST_STATS.googleRating}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {TRUST_STATS.totalReviews.toLocaleString()}+ verified reviews
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Compact trust bar for headers/footers
export function TrustBar() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-emerald-500" />
        <span>Government Registered</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-emerald-500" />
        <span>100% Secure</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-emerald-500" />
        <span>30-min Callback</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500" />
        <span>{TRUST_STATS.googleRating} Google Rating</span>
      </div>
    </div>
  );
}

// Main combined trust section
export function TrustSection() {
  return (
    <>
      <StatsSection />
      <ClientLogosSection />
      <TestimonialsSection />
      <VideoTestimonialCTA />
    </>
  );
}
