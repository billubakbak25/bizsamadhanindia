import { MapPinned, Navigation } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buttonClassName } from "@/components/ui/Button";

type GoogleMapEmbedProps = {
  title: string;
  description: string;
  embedUrl: string;
  directionsUrl: string;
  address: string;
};

export function GoogleMapEmbed({ title, description, embedUrl, directionsUrl, address }: GoogleMapEmbedProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--line)] px-6 py-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">Office map</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{title}</h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-[var(--brand)] dark:bg-emerald-950/40">
            <MapPinned className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="px-6 pt-6 sm:px-8">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <iframe
            title={`Google Map showing ${address}`}
            src={embedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[320px] w-full border-0 sm:h-[420px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{address}</p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName({ variant: "secondary", className: "gap-2 self-start sm:self-auto" })}
        >
          <Navigation className="h-4 w-4" />
          Get directions
        </a>
      </div>
    </Card>
  );
}
