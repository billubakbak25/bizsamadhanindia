"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, X, ChevronUp, Star, Clock, Shield } from "lucide-react";
import { formatServicePrice } from "@/lib/pricing";
import { BUSINESS_CONTACT, TRUST_STATS } from "@/lib/constants";

type StickyCTAProps = {
  serviceName: string;
  cityName: string;
  serviceCode: string;
  price?: number | null;
  targetId?: string;
};

const whatsappHref = `https://wa.me/${BUSINESS_CONTACT.whatsappNumber}`;
const whatsappGreetingHref = `${whatsappHref}?text=Hi%2C%20I%20need%20help%20with%20business%20services`;
const primaryCallHref = `tel:+91${BUSINESS_CONTACT.primaryPhones[0]}`;

function trackStickyClick(action: string, payload: Record<string, unknown>) {
  const eventPayload = { event: "cta_click", placement: "sticky", action, ...payload };
  console.log("FUNNEL_EVENT:", eventPayload);

  if (typeof window !== "undefined") {
    const targetWindow = window as Window & { dataLayer?: Record<string, unknown>[] };
    targetWindow.dataLayer?.push(eventPayload);
  }
}

export function StickyCTA({ serviceName, cityName, serviceCode, price = null, targetId = "lead-form" }: StickyCTAProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const href = `#${targetId}`;
  const priceLabel = price ? formatServicePrice(price) : "Get Quote";
  const trackPayload = { serviceCode, serviceName, cityName, price: price || null };

  // Show sticky CTA after scrolling 400px
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-3 bottom-3 z-40 lg:inset-x-auto lg:right-6 lg:w-[420px]"
        >
          {/* Mobile version */}
          <div className="lg:hidden">
            <AnimatePresence>
              {isExpanded ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden rounded-t-3xl border border-b-0 border-slate-200 bg-white shadow-xl"
                >
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
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
                      </div>
                      <button
                        onClick={() => setIsExpanded(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                        <Clock className="mx-auto h-4 w-4" />
                        <span className="mt-1 block font-medium">30 min callback</span>
                      </div>
                      <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
                        <Shield className="mx-auto h-4 w-4" />
                        <span className="mt-1 block font-medium">100% Secure</span>
                      </div>
                      <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
                        <Star className="mx-auto h-4 w-4" />
                        <span className="mt-1 block font-medium">Expert Support</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            
            <div className={`rounded-3xl border border-emerald-100 bg-white/95 p-2 shadow-2xl shadow-emerald-950/20 backdrop-blur ${isExpanded ? "rounded-t-none border-t-0" : ""}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                >
                  <ChevronUp className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{serviceName}</p>
                  <p className="text-xs text-slate-500">{cityName} - {priceLabel}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStickyClick("whatsapp", trackPayload)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-white shadow-sm"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>
                  <Link
                    href={href}
                    onClick={() => trackStickyClick("buy_now", trackPayload)}
                    className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
                  >
                    <Phone className="h-4 w-4" />
                    Get Quote
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop version */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-emerald-100 bg-white/95 p-4 shadow-2xl shadow-emerald-950/20 backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Limited Offer</p>
                  <p className="text-sm font-semibold text-slate-950">{serviceName} in {cityName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[var(--brand)]">{priceLabel}</p>
                  <p className="text-xs text-slate-500">onwards</p>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-500" />
                  30 min callback
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-500" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(TRUST_STATS.googleRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  {TRUST_STATS.googleRating}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackStickyClick("whatsapp", trackPayload)}
                  className="flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <Link
                  href={href}
                  onClick={() => trackStickyClick("buy_now", trackPayload)}
                  className="flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-deep)]"
                >
                  <Phone className="h-4 w-4" />
                  Get Quote Now
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating WhatsApp Button for global use
export function FloatingWhatsApp() {
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(true), 3000);
    const hideTimer = setTimeout(() => setShowTooltip(false), 8000);
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:bottom-6">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"
          >
            Need help? Chat with us!
            <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-slate-900" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.a
        href={whatsappGreetingHref}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-green-400 text-[10px] font-bold">1</span>
        </span>
      </motion.a>
    </div>
  );
}

// Call Button for mobile
export function FloatingCallButton() {
  return (
    <motion.a
      href={primaryCallHref}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 1.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 left-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-lg shadow-emerald-500/30 lg:hidden"
      aria-label="Call us"
    >
      <Phone className="h-6 w-6" />
    </motion.a>
  );
}
