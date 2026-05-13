"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  Phone,
  ArrowRight,
  Command as CommandIcon,
} from "lucide-react";
import { MEGA_MENU_CATEGORIES, QUICK_LINKS } from "@/lib/constants";

const ICONS: Record<string, React.ElementType> = {
  Briefcase,
  FileText,
  Shield,
  Calculator,
  Scale,
  Phone,
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Open on Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  // Flatten all items for search
  const allItems = MEGA_MENU_CATEGORIES.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      category: category.label,
      categoryIcon: category.icon,
    }))
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 transition hover:border-slate-300 hover:text-slate-700 lg:flex"
      >
        <Search className="h-4 w-4" />
        <span>Search services...</span>
        <kbd className="ml-2 flex items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
          <CommandIcon className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2"
            >
              <Command className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4">
                  <Search className="h-5 w-5 text-slate-400" />
                  <Command.Input
                    placeholder="Search services, registrations, compliance..."
                    className="h-14 w-full bg-transparent text-base outline-none placeholder:text-slate-400"
                  />
                </div>

                <Command.List className="max-h-[400px] overflow-y-auto p-2">
                  <Command.Empty className="py-6 text-center text-sm text-slate-500">
                    No results found. Try a different search term.
                  </Command.Empty>

                  <Command.Group heading="Quick Actions" className="p-2">
                    <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Quick Actions
                    </p>
                    {QUICK_LINKS.map((link) => (
                      <Command.Item
                        key={link.href}
                        value={link.label}
                        onSelect={() => runCommand(() => router.push(link.href))}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 data-[selected=true]:bg-emerald-50 data-[selected=true]:text-[var(--brand)]"
                      >
                        <Phone className="h-4 w-4 text-slate-400" />
                        {link.label}
                        <ArrowRight className="ml-auto h-4 w-4 text-slate-300" />
                      </Command.Item>
                    ))}
                  </Command.Group>

                  {MEGA_MENU_CATEGORIES.map((category) => {
                    const Icon = ICONS[category.icon] || Briefcase;
                    return (
                      <Command.Group key={category.id} heading={category.label} className="p-2">
                        <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          <Icon className="h-3.5 w-3.5" />
                          {category.label}
                        </p>
                        {category.items.map((item) => (
                          <Command.Item
                            key={item.href + item.label}
                            value={`${item.label} ${item.description || ""} ${category.label}`}
                            onSelect={() => runCommand(() => router.push(item.href))}
                            className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition hover:bg-slate-50 data-[selected=true]:bg-emerald-50"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-900 data-[selected=true]:text-[var(--brand)]">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-700">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                          </Command.Item>
                        ))}
                      </Command.Group>
                    );
                  })}
                </Command.List>

                <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">↑↓</kbd> Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">↵</kbd> Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5">Esc</kbd> Close
                    </span>
                  </div>
                </div>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
