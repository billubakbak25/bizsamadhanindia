import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">This route does not exist in the new Next.js app.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">The legacy hybrid pages have been removed. Use the service catalog or dashboard links below to continue.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={buttonClassName({ size: "lg" })}>Go home</Link>
          <Link href="/services" className={buttonClassName({ variant: "secondary", size: "lg" })}>Browse services</Link>
        </div>
      </div>
    </main>
  );
}
