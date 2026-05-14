import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { ServiceCategories } from "@/components/sections/ServiceCategories";
import { 
  StatsSection, 
  TestimonialsSection, 
  ClientLogosSection, 
  VideoTestimonialCTA,
  TrustBadgesSection
} from "@/components/sections/TrustSignals";
import { Card } from "@/components/ui/Card";
import { BUSINESS_CONTACT, FAQS, PROCESS_STEPS } from "@/lib/constants";
import { CheckCircle2, ArrowRight, Phone, Zap } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "India's #1 Legal Services Platform | BizSamadhan India",
  description: "Start, protect and grow your business with expert legal support. Company registration, GST, trademark, compliance and more. 50,000+ businesses served. Rated 4.7/5 on Google.",
  keywords: "company registration, gst registration, trademark registration, llp registration, business compliance, legal services india",
  openGraph: {
    title: "India's #1 Legal Services Platform | BizSamadhan India",
    description: "Start, protect and grow your business with expert legal support. 50,000+ businesses served.",
    type: "website",
  },
};

// Process section with enhanced visuals
function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Share Requirements",
      description: "Fill a simple form or call us. We understand your business needs and recommend the right service.",
      icon: "form"
    },
    {
      number: "02", 
      title: "Expert Consultation",
      description: "Get connected with a dedicated CA/lawyer who guides you through the process and documentation.",
      icon: "expert"
    },
    {
      number: "03",
      title: "We Handle Everything",
      description: "From paperwork to government filings, we manage the complete process while you focus on your business.",
      icon: "process"
    }
  ];

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
            <Zap className="h-3.5 w-3.5" />
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
            3 Simple Steps to Get Started
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            We&apos;ve simplified the legal process so you can focus on building your business
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="absolute right-0 top-12 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-emerald-300 to-emerald-100 lg:block" />
              )}
              
              <Card className="relative z-10 h-full p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-xl font-bold text-[var(--brand)]">
                  {step.number}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/consultation"
            className={buttonClassName({ size: "lg", className: "gap-2" })}
          >
            <Phone className="h-4 w-4" />
            Start Your Journey - Free Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}

// FAQ section with enhanced design
function FAQSection() {
  const faqs = [
    {
      question: "How long does company registration take?",
      answer: "Private Limited Company registration typically takes 7-10 working days after all documents are submitted. LLP registration takes 10-15 days. We provide real-time tracking throughout the process."
    },
    {
      question: "What documents are required for GST registration?",
      answer: "You'll need PAN card, Aadhaar card, business address proof, bank statement, and photographs. Our team will provide a detailed checklist based on your business type."
    },
    {
      question: "Is my data secure with BizSamadhan?",
      answer: "Absolutely. We use bank-grade encryption, are ISO 9001:2015 certified, and follow strict data protection policies. Your documents are handled with complete confidentiality."
    },
    {
      question: "Do you provide post-registration support?",
      answer: "Yes! We provide comprehensive post-registration support including compliance reminders, annual filing assistance, and ongoing expert consultations."
    },
    {
      question: "What is included in your pricing?",
      answer: "Our pricing is all-inclusive with no hidden charges. It covers professional fees, documentation support, filing assistance, and basic compliance guidance. Government fees are charged separately and communicated upfront."
    },
    {
      question: "Can I track my application status?",
      answer: "Yes, you get real-time updates via WhatsApp, email, and our client portal. You can track every stage of your application from submission to completion."
    }
  ];

  return (
    <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[var(--brand)] shadow-sm">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Can&apos;t find what you&apos;re looking for? Our experts are just a call away.
            </p>
            <div className="mt-6">
              <Link
                href="/consultation"
                className={buttonClassName({ variant: "secondary", className: "gap-2" })}
              >
                Talk to an Expert
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left">
                  <span className="font-semibold text-slate-900 group-open:text-[var(--brand)]">
                    {faq.question}
                  </span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:bg-emerald-100 group-open:text-emerald-600">
                    <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Final CTA section
function FinalCTA() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--brand)] to-teal-600 px-8 py-12 text-center text-white lg:py-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Start Your Business Journey?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              Join 50,000+ entrepreneurs who trusted BizSamadhan for their business registration 
              and compliance needs. Get started with a free consultation today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/consultation"
                className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-[var(--brand)] shadow-lg transition hover:bg-emerald-50"
              >
                <Phone className="h-5 w-5" />
                Get Free Expert Consultation
              </Link>
              <Link 
                href="/services"
                className="flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Explore Services
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <p className="mt-6 text-sm text-emerald-200">
              Or call us directly: <a href={`tel:+91${BUSINESS_CONTACT.primaryPhones[0]}`} className="font-semibold text-white">{BUSINESS_CONTACT.primaryPhoneDisplay[0]}</a>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadgesSection />
      <ServiceCategories />
      <ProcessSection />
      <StatsSection />
      <ClientLogosSection />
      <TestimonialsSection />
      <VideoTestimonialCTA />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
