import Link from "next/link";
import { BUSINESS_CONTACT, COMPANY, TRUST_STATS } from "@/lib/constants";
import { MegaMenu } from "./MegaMenu";
import { MobileMenu } from "./MobileMenu";
import { GlobalSearch } from "./GlobalSearch";
import { Star, Phone, Mail, MapPin, Clock, Shield } from "lucide-react";

function TrustBadge() {
  return (
    <div className="hidden items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 xl:flex">
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
      <span className="text-xs font-semibold text-amber-700">{TRUST_STATS.googleRating}</span>
      <span className="text-xs text-amber-600">Google</span>
    </div>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-40">
      {/* Top bar with trust signals and contact - hidden on mobile */}
      <div className="hidden border-b border-slate-100 bg-slate-900 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-medium text-white">{TRUST_STATS.clientsServed.toLocaleString()}+</span>
              <span>businesses served</span>
            </span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Government Registered</span>
            </span>
            <span className="hidden text-slate-600 sm:inline">|</span>
            <span className="hidden items-center gap-1.5 sm:flex">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Mon-Sat 9:30AM-7PM</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a 
              href={`tel:+91${BUSINESS_CONTACT.primaryPhones[0]}`}
              className="flex items-center gap-1.5 font-medium text-white transition hover:text-emerald-400"
            >
              <Phone className="h-3.5 w-3.5" />
              {BUSINESS_CONTACT.primaryPhoneDisplay[0]}
            </a>
            <span className="text-slate-600">|</span>
            <a 
              href={`mailto:${COMPANY.email}`} 
              className="flex items-center gap-1.5 text-slate-300 transition hover:text-white"
            >
              <Mail className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{COMPANY.email}</span>
            </a>
            <span className="hidden text-slate-600 xl:inline">|</span>
            <span className="hidden items-center gap-1.5 text-slate-300 xl:flex">
              <MapPin className="h-3.5 w-3.5" />
              {COMPANY.city}
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="border-b border-white/60 bg-[rgba(246,245,239,0.96)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-teal-600 text-sm font-bold text-white shadow-lg shadow-emerald-950/20 lg:h-11 lg:w-11 lg:rounded-2xl">
              WA
            </span>
            <span className="hidden sm:block">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)] lg:text-xs lg:tracking-[0.24em]">
                SaaS Legal Ops
              </span>
              <span className="block text-base font-bold text-slate-950 lg:text-lg">{COMPANY.name}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <MegaMenu />

          {/* Right side */}
          <div className="flex items-center gap-2 lg:gap-3">
            <TrustBadge />
            <GlobalSearch />
            <Link
              href="/client-portal"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md lg:inline-flex"
            >
              Client Portal
            </Link>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
