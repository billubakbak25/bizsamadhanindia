import Link from "next/link";
import { LeadCaptureForm } from "@/components/forms/LeadCaptureForm";
import { buttonClassName } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BUSINESS_CONTACT, findServiceCard, TRUST_STATS, MEGA_MENU_CATEGORIES, type MarketingPageContent } from "@/lib/constants";
import { fetchServicePricing, formatServicePrice } from "@/lib/pricing";
import { 
  CheckCircle2, 
  Clock, 
  Shield, 
  Users, 
  Star, 
  Phone, 
  ArrowRight, 
  FileCheck, 
  BadgeCheck,
  Zap,
  Building2,
  HelpCircle,
  ChevronDown,
  Play,
  Award,
  TrendingUp,
  MessageCircle
} from "lucide-react";

// Process steps visualization
function ProcessSteps({ serviceName }: { serviceName: string }) {
  const steps = [
    { number: 1, title: "Share Requirements", description: "Fill the form with basic details", icon: FileCheck },
    { number: 2, title: "Expert Consultation", description: "Get personalized guidance", icon: Users },
    { number: 3, title: "Document Submission", description: "Upload required documents", icon: Shield },
    { number: 4, title: "Application Filing", description: "We handle the paperwork", icon: Building2 },
    { number: 5, title: "Completion", description: "Get your certificate/registration", icon: BadgeCheck },
  ];

  return (
    <div className="relative">
      <div className="mb-6 flex items-center gap-2">
        <Zap className="h-5 w-5 text-amber-500" />
        <h2 className="text-2xl font-bold text-slate-950">How It Works</h2>
      </div>
      <div className="relative">
        {/* Connection line */}
        <div className="absolute left-8 top-12 hidden h-[calc(100%-60px)] w-0.5 bg-gradient-to-b from-emerald-500 via-emerald-300 to-emerald-100 lg:block" />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className="group relative flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 transition group-hover:from-emerald-100 group-hover:to-teal-100">
                <step.icon className="h-7 w-7 text-[var(--brand)]" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                  {step.number}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 text-slate-300 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Trust signals section
function TrustSignals() {
  const signals = [
    { icon: Star, value: `${TRUST_STATS.googleRating}`, label: "Google Rating", color: "amber" },
    { icon: Users, value: `${TRUST_STATS.clientsServed.toLocaleString()}+`, label: "Happy Customers", color: "emerald" },
    { icon: Award, value: `${TRUST_STATS.yearsExperience}+ Years`, label: "Experience", color: "blue" },
    { icon: Shield, value: "100%", label: "Secure & Confidential", color: "purple" },
  ];

  const colorClasses = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {signals.map((signal) => {
        const colors = colorClasses[signal.color as keyof typeof colorClasses];
        return (
          <div key={signal.label} className={`flex items-center gap-3 rounded-2xl border p-4 ${colors}`}>
            <signal.icon className="h-6 w-6 shrink-0" />
            <div>
              <p className="text-xl font-bold">{signal.value}</p>
              <p className="text-xs">{signal.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// FAQ Accordion
function FAQSection({ serviceName, faqs }: { serviceName: string; faqs?: { question: string; answer: string }[] }) {
  const defaultFaqs = [
    {
      question: `How long does ${serviceName} take?`,
      answer: "The timeline varies based on document readiness and government processing times. Typically, the initial steps are completed within 2-5 business days after all documents are submitted."
    },
    {
      question: "What documents are required?",
      answer: "Our team will provide a detailed checklist after understanding your specific requirements. Generally, you'll need identity proofs, address proofs, and business-related documents."
    },
    {
      question: "Is there any hidden cost?",
      answer: "No hidden charges. The price shown includes our professional fees. Government fees, if applicable, are communicated clearly before proceeding."
    },
    {
      question: "Can I track my application status?",
      answer: "Yes, you'll receive regular updates via WhatsApp and email. You can also track progress through our client portal."
    },
    {
      question: "What support do I get after completion?",
      answer: "We provide post-completion support including guidance on next compliance steps, document management, and expert consultations when needed."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-grade encryption and strict data protection policies. Your documents and information are handled with complete confidentiality."
    },
  ];

  const displayFaqs = faqs || defaultFaqs;

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-[var(--brand)]" />
        <h2 className="text-2xl font-bold text-slate-950">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-3">
        {displayFaqs.map((faq, index) => (
          <details 
            key={index} 
            className="group rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left">
              <span className="font-semibold text-slate-900 group-open:text-[var(--brand)]">
                {faq.question}
              </span>
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-100 px-5 py-4">
              <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </Card>
  );
}

// Related services
function RelatedServices({ currentSlug }: { currentSlug: string }) {
  const allServices = MEGA_MENU_CATEGORIES.flatMap(cat => 
    cat.items.map(item => ({ ...item, category: cat.label }))
  ).filter(s => !s.href.includes(currentSlug)).slice(0, 4);

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-950">Related Services</h2>
        <Link 
          href="/services" 
          className="flex items-center gap-1 text-sm font-semibold text-[var(--brand)] hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {allServices.map((service) => (
          <Link
            key={service.href}
            href={service.href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 transition group-hover:bg-emerald-100">
              <CheckCircle2 className="h-6 w-6 text-[var(--brand)]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-slate-900 group-hover:text-[var(--brand)]">
                {service.label}
              </p>
              <p className="text-xs text-slate-500">{service.category}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[var(--brand)]" />
          </Link>
        ))}
      </div>
    </Card>
  );
}

// Video CTA Section
function VideoCTA({ serviceName }: { serviceName: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
      <div className="relative flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
          <Play className="h-10 w-10 fill-white text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">Watch How We Help You With {serviceName}</h3>
          <p className="mt-2 text-sm text-slate-300">
            See our step-by-step process and hear from customers who trusted us
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-emerald-50">
          <Play className="h-4 w-4 fill-current" />
          Watch Video
        </button>
      </div>
    </div>
  );
}

// Expert consultation CTA
function ExpertCTA() {
  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <Phone className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-100">Have Questions?</p>
            <p className="text-xl font-bold">Talk to Our Experts</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <ul className="space-y-3">
          {[
            "Free 15-min consultation",
            "Get instant clarity on process",
            "Custom quote for your needs",
            "Expert CA & lawyer support"
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-3">
          <Link
            href="/consultation"
            className={buttonClassName({ size: "lg", className: "w-full justify-center gap-2" })}
          >
            <Phone className="h-4 w-4" />
            Book Free Consultation
          </Link>
          <a
            href={`https://wa.me/${BUSINESS_CONTACT.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClassName({ variant: "secondary", size: "lg", className: "w-full justify-center gap-2" })}
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </Card>
  );
}

export async function ServiceDetail({ page }: { page: MarketingPageContent }) {
  const serviceCard = findServiceCard(page.leadService);
  const pricing = serviceCard ? await fetchServicePricing(serviceCard.code).catch(() => null) : null;

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl space-y-12">
        
        {/* Hero Section */}
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="hover:text-[var(--brand)]">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-[var(--brand)]">Services</Link>
              <span>/</span>
              <span className="text-slate-900">{page.title}</span>
            </nav>

            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700">
                <Zap className="h-3.5 w-3.5" />
                {page.eyebrow}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                <TrendingUp className="h-3.5 w-3.5" />
                50,000+ Customers
              </span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                {page.title}
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600">{page.hero}</p>
            </div>

            {/* Price tag */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--brand)]">
                  {formatServicePrice(pricing?.finalPrice)}
                </span>
                <span className="text-sm text-slate-500">onwards</span>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                All-inclusive pricing
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link 
                href={page.primaryCta?.href || "/consultation"} 
                className={buttonClassName({ size: "lg", className: "justify-center gap-2" })}
              >
                <Phone className="h-4 w-4" />
                {page.primaryCta?.label || "Talk to an Expert"}
              </Link>
              <Link 
                href="/services" 
                className={buttonClassName({ variant: "secondary", size: "lg", className: "justify-center gap-2" })}
              >
                Browse All Services
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Highlights */}
            <div className="grid gap-3 sm:grid-cols-3">
              {page.highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Form */}
          <div className="lg:sticky lg:top-32">
            <LeadCaptureForm
              defaultService={page.leadService}
              title="Get Expert Assistance"
              description="Share your details for a free consultation or pay securely to start immediately."
              allowPayment
              servicePrice={pricing?.finalPrice ?? null}
            />
          </div>
        </div>

        {/* Trust Signals */}
        <TrustSignals />

        {/* Process Steps */}
        <ProcessSteps serviceName={page.title} />

        {/* Video CTA */}
        <VideoCTA serviceName={page.title} />

        {/* Deliverables + Content Sections */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-[var(--brand)]" />
              <h2 className="text-2xl font-bold text-slate-950">What You Get</h2>
            </div>
            <ul className="space-y-4">
              {page.deliverables.map((item, index) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-medium text-slate-900">{item}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="space-y-4">
            {page.sections.map((section) => (
              <Card key={section.title} className="p-6">
                <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection serviceName={page.title} />

        {/* Related Services + Expert CTA */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <RelatedServices currentSlug={page.slug} />
          <ExpertCTA />
        </div>

        {/* Final CTA */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--brand)] to-teal-600 px-8 py-10 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-emerald-100">
              Join 50,000+ businesses who trust us for their {page.title.toLowerCase()} needs. 
              Get expert guidance and hassle-free service.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/consultation"
                className="flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-[var(--brand)] shadow-lg transition hover:bg-emerald-50"
              >
                <Phone className="h-5 w-5" />
                Get Free Consultation
              </Link>
              <span className="text-sm text-emerald-200">or call us at {BUSINESS_CONTACT.primaryPhoneDisplay[0]}</span>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
