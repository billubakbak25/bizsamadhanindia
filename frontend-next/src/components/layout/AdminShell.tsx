"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { GlobalAdminSearch } from "@/components/admin/GlobalAdminSearch";
import { ApiHealthChip } from "@/components/ui/ApiHealthChip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ADMIN_MODULE_NAV } from "@/lib/constants";
import { adminGet, adminPost, normalizeAdminPath } from "@/lib/apiClient";

export type AdminSession = {
  authenticated?: boolean;
  admin?: {
    username?: string;
    authenticatedAt?: string;
    role?: string;
  } | null;
};

type AdminShellProps = {
  title: string;
  description: string;
  activeHref: string;
  badge?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const LOGIN_STATE = {
  username: "",
  password: "",
};

function navClass(active: boolean) {
  return [
    "rounded-full border px-4 py-2 text-sm font-semibold transition",
    active
      ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-lg shadow-emerald-950/15"
      : "border-white/10 bg-white/5 text-slate-200 hover:border-white/30 hover:text-white",
  ].join(" ");
}

export function AdminShell({ title, description, activeHref, badge = "Admin console", actions, children }: AdminShellProps) {
  const [session, setSession] = useState<AdminSession>({ authenticated: false, admin: null });
  const [credentials, setCredentials] = useState(LOGIN_STATE);
  const [status, setStatus] = useState("Checking admin session...");
  const [busy, setBusy] = useState(false);

  const authenticated = Boolean(session.authenticated);
  const navItems = useMemo(() => ADMIN_MODULE_NAV, []);

  async function loadSession() {
    const next = await adminGet<AdminSession>("/session", { cache: "no-store" }, "admin.session");
    setSession(next);
    setStatus(next.authenticated ? "Admin session active." : "Admin login required.");
    return next;
  }

  useEffect(() => {
    void loadSession().catch((error) => {
      setStatus(error instanceof Error ? error.message : "Unable to verify admin session.");
    });
  }, []);

  function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("Signing in...");

    startTransition(async () => {
      try {
        const loginUrl = normalizeAdminPath("/login");
        console.log("[Admin login] request", {
          url: loginUrl,
          body: {
            username: credentials.username,
            password: credentials.password ? "***" : "",
          },
        });
        await adminPost("/login", { method: "POST", json: credentials }, "admin.login");
        const next = await loadSession();
        if (next.authenticated) {
          setCredentials(LOGIN_STATE);
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Invalid admin credentials.");
      } finally {
        setBusy(false);
      }
    });
  }

  function handleLogout() {
    setBusy(true);
    setStatus("Signing out...");

    startTransition(async () => {
      try {
        await adminPost("/logout", { method: "POST" }, "admin.logout");
        setSession({ authenticated: false, admin: null });
        setStatus("Signed out successfully.");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Unable to sign out.");
      } finally {
        setBusy(false);
      }
    });
  }

  if (!authenticated) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="hero-shell border-b border-[var(--line)] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{badge}</p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 text-balance">{title}</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <ApiHealthChip label="API" />
                {navItems.slice(0, 3).map((item) => (
                  <span key={item.href} className="rounded-full border border-white/60 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700">{item.label}</span>
                ))}
              </div>
            </div>
            <form className="space-y-4 px-6 py-8 sm:px-8" onSubmit={handleLogin}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">Secure access</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Sign in to continue</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">The admin panel uses the existing Railway session endpoint so the new modules stay compatible with the current backend.</p>
              </div>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Username</span>
                <input value={credentials.username} onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
              </label>
              <label className="block space-y-2 text-sm font-medium text-slate-700">
                <span>Password</span>
                <input value={credentials.password} onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))} type="password" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-[var(--brand)]" required />
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">{status}</p>
                <Button type="submit" disabled={busy}>{busy ? "Signing in..." : "Login to admin"}</Button>
              </div>
            </form>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand)]">{badge}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ApiHealthChip label="API" />
            <Button variant="secondary" onClick={() => void loadSession()}>Refresh session</Button>
            <Button variant="ghost" onClick={handleLogout} disabled={busy}>Logout</Button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={navClass(activeHref === item.href)}>
              {item.label}
            </Link>
          ))}
        </div>
        <GlobalAdminSearch />
        <p className="mt-4 text-sm text-slate-600">{status}</p>
      </Card>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      {children}
    </div>
  );
}
