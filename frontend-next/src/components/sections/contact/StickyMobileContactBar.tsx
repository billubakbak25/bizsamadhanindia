import { Mail, MessageCircle, Phone } from "lucide-react";

type StickyMobileContactBarProps = {
  callHref: string;
  whatsappHref: string;
  emailHref: string;
};

export function StickyMobileContactBar({ callHref, whatsappHref, emailHref }: StickyMobileContactBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/96 px-3 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/96">
      <div className="mx-auto grid max-w-7xl grid-cols-3 gap-2">
        <a
          href={callHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/15"
          aria-label="Call Wadhwani Associates support"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-green-500 px-3 text-sm font-semibold text-white shadow-lg shadow-green-950/15"
          aria-label="Chat on WhatsApp with Wadhwani Associates support"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
        <a
          href={emailHref}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label="Email Wadhwani Associates support"
        >
          <Mail className="h-4 w-4" />
          Email
        </a>
      </div>
    </div>
  );
}
