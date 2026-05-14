import Link from "next/link";
import { BUSINESS_CONTACT, COMPANY, SERVICE_LIBRARY } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Wadhwani Associates</p>
          <h2 className="max-w-md text-3xl font-semibold text-white">A future-ready legal and compliance platform for Indian growth teams.</h2>
          <p className="max-w-xl text-sm leading-7 text-slate-400">{COMPANY.description}</p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Popular Services</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            {SERVICE_LIBRARY.map((service) => (
              <li key={service.slug}>
                <Link href={`/${service.slug}`} className="transition hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Company</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>{COMPANY.city}</li>
            <li>{COMPANY.email}</li>
            <li>
              <Link href="/privacy-policy" className="transition hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="transition hover:text-white">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link href="/payment-methods" className="transition hover:text-white">
                Payment Methods
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="transition hover:text-white">
                Refund Policy
              </Link>
            </li>
            <li>
              <Link href="/cancellation-policy" className="transition hover:text-white">
                Cancellation Policy
              </Link>
            </li>
            <li>
              <Link href="/service-delivery-policy" className="transition hover:text-white">
                Service Delivery Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-slate-300 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <p className="font-semibold text-white">{BUSINESS_CONTACT.businessName}</p>
            <p className="mt-2">Official Support: {BUSINESS_CONTACT.supportPerson}</p>
            <p className="mt-1">{BUSINESS_CONTACT.supportEmail}</p>
            <p className="mt-1">{BUSINESS_CONTACT.primaryPhoneDisplay[0]}</p>
            <p className="mt-1">{BUSINESS_CONTACT.primaryPhoneDisplay[1]}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Office Address:</p>
            <address className="mt-2 not-italic leading-7">
              LIG 25 SF Colony, Barra 3,<br />
              Kanpur, Uttar Pradesh - 208027
            </address>
            <p className="mt-3 text-xs text-slate-500">
              Biz Samadhan India is the website and marketing identity operated by Wadhwani Associates.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
