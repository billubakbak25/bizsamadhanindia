import Link from "next/link";
import { MARKETING_NAV } from "@/lib/constants";

export function Navbar() {
  return (
    <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
      {MARKETING_NAV.map((item) => (
        <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
