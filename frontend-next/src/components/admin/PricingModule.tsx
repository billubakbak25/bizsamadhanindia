"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createAdminPricingRule,
  fetchAdminPricingRules,
  fetchAdminPricingServices,
  saveAdminPricingService,
  updateAdminPricingRule,
  updateAdminPricingService,
  type AdminRecord,
} from "@/lib/adminData";
import { Button } from "@/components/ui/Button";
import { EmptyState, Panel, StatusBadge, SummaryCard, formatCurrency } from "./shared";

function serviceCodeOf(service: AdminRecord) {
  return String(service.code ?? service.service_code ?? "").trim();
}

function serviceNameOf(service: AdminRecord) {
  return String(service.name ?? service.service_name ?? serviceCodeOf(service) ?? "Service");
}

function boolValue(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value > 0;
  }
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  return ["true", "1", "yes", "on"].includes(normalized);
}

export function PricingModule() {
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState("");
  const [status, setStatus] = useState("Loading pricing catalog...");
  const [services, setServices] = useState<AdminRecord[]>([]);
  const [rules, setRules] = useState<AdminRecord[]>([]);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [selectedServiceCode, setSelectedServiceCode] = useState("");
  const [ruleDraft, setRuleDraft] = useState({
    serviceCode: "",
    type: "discount",
    value: "10",
    condition: "",
    isActive: true,
  });

  async function load() {
    setLoading(true);
    try {
      const [serviceResult, ruleResult] = await Promise.all([
        fetchAdminPricingServices(),
        fetchAdminPricingRules(),
      ]);
      setServices(serviceResult.items);
      setRules(ruleResult.items);
      setPriceDrafts(Object.fromEntries(serviceResult.items.map((service) => [serviceCodeOf(service), String(service.basePrice ?? service.base_price ?? 0)])));
      const nextServiceCode = serviceCodeOf(serviceResult.items[0] ?? {});
      setSelectedServiceCode((current) => current || nextServiceCode);
      setRuleDraft((current) => ({ ...current, serviceCode: current.serviceCode || nextServiceCode }));
      setStatus("Pricing catalog synced.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to load pricing catalog.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedRules = useMemo(() => {
    if (!selectedServiceCode) {
      return rules;
    }
    return rules.filter((rule) => String(rule.service_code ?? rule.serviceCode ?? "") === selectedServiceCode);
  }, [rules, selectedServiceCode]);

  async function handleSaveService(service: AdminRecord) {
    const code = serviceCodeOf(service);
    if (!code) {
      return;
    }

    setBusyCode(code);
    try {
      const payload = {
        code,
        name: serviceNameOf(service),
        basePrice: Number(priceDrafts[code] || 0),
        isActive: boolValue(service.isActive ?? service.is_active, true),
      };
      const response = await updateAdminPricingService(code, payload);
      const next = response.data ?? response;
      setServices((current) => current.map((entry) => (serviceCodeOf(entry) === code ? { ...entry, ...next } : entry)));
      setStatus(`${serviceNameOf(service)} pricing updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update service pricing.");
    } finally {
      setBusyCode("");
    }
  }

  async function handleToggleService(service: AdminRecord) {
    const code = serviceCodeOf(service);
    if (!code) {
      return;
    }

    setBusyCode(code);
    try {
      const payload = {
        code,
        name: serviceNameOf(service),
        basePrice: Number(priceDrafts[code] || service.basePrice || service.base_price || 0),
        isActive: !boolValue(service.isActive ?? service.is_active, true),
      };
      const response = await updateAdminPricingService(code, payload);
      const next = response.data ?? response;
      setServices((current) => current.map((entry) => (serviceCodeOf(entry) === code ? { ...entry, ...next } : entry)));
      setStatus(`${serviceNameOf(service)} status updated.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update service status.");
    } finally {
      setBusyCode("");
    }
  }

  async function handleCreateRule() {
    setBusyCode("rule-create");
    try {
      const created = await createAdminPricingRule({
        serviceCode: ruleDraft.serviceCode,
        type: ruleDraft.type,
        value: Number(ruleDraft.value || 0),
        condition: ruleDraft.condition,
        isActive: ruleDraft.isActive,
      });
      const nextRule = created.data ?? created;
      setRules((current) => [nextRule, ...current]);
      setRuleDraft((current) => ({ ...current, value: "10", condition: "" }));
      setStatus("Pricing rule created.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to create pricing rule.");
    } finally {
      setBusyCode("");
    }
  }

  async function handleToggleRule(rule: AdminRecord) {
    const id = String(rule.id ?? "");
    if (!id) {
      return;
    }

    setBusyCode(id);
    try {
      const updated = await updateAdminPricingRule(id, {
        isActive: !boolValue(rule.is_active ?? rule.isActive, true),
      });
      const nextRule = updated.data ?? updated;
      setRules((current) => current.map((entry) => (String(entry.id ?? "") === id ? { ...entry, ...nextRule } : entry)));
      setStatus("Pricing rule updated.");
      await load();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to update pricing rule.");
    } finally {
      setBusyCode("");
    }
  }

  return (
    <div className="space-y-6">
      <Panel
        eyebrow="Pricing engine"
        title="Dynamic pricing control"
        description="Base prices and live rules now flow from one backend pricing catalog. Update a service once and payment, admin, and service pages stay aligned."
        actions={<Button type="button" variant="secondary" onClick={() => void load()}>Reload pricing</Button>}
      >
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          <SummaryCard label="Services" value={String(services.length)} caption="Pricing catalog entries" />
          <SummaryCard label="Active services" value={String(services.filter((service) => boolValue(service.isActive ?? service.is_active, true)).length)} caption="Payable or visible services" accent="amber" />
          <SummaryCard label="Rules" value={String(rules.length)} caption="Discount and flat adjustments" accent="rose" />
          <SummaryCard label="Selected" value={selectedServiceCode || "none"} caption="Focused rules and edits" accent="slate" />
        </div>
        <p className="mt-4 text-sm text-slate-300">{status}</p>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel eyebrow="Service prices" title="Base price catalog" description="These are rupee values. Razorpay conversion to paisa happens in the backend payment flow.">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-[20px] border border-white/10 bg-white/[0.04]" />
              ))}
            </div>
          ) : services.length ? (
            <div className="space-y-3">
              {services.map((service) => {
                const code = serviceCodeOf(service);
                const active = boolValue(service.isActive ?? service.is_active, true);
                return (
                  <div key={code} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{serviceNameOf(service)}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{code}</p>
                        <p className="mt-2 text-sm text-slate-300">Live price: {formatCurrency(service.finalPrice ?? service.final_price ?? service.basePrice ?? service.base_price ?? 0)}</p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                          <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Base price (INR)</span>
                          <input
                            value={priceDrafts[code] ?? String(service.basePrice ?? service.base_price ?? 0)}
                            onChange={(event) => setPriceDrafts((current) => ({ ...current, [code]: event.target.value }))}
                            className="mt-2 w-28 bg-transparent text-base font-semibold outline-none"
                            inputMode="numeric"
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={active ? "active" : "inactive"} />
                          <Button type="button" variant="secondary" onClick={() => void handleToggleService(service)} disabled={busyCode === code}>
                            {active ? "Disable" : "Enable"}
                          </Button>
                          <Button type="button" onClick={() => void handleSaveService(service)} disabled={busyCode === code}>
                            {busyCode === code ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No pricing catalog" description="The pricing catalog has not been seeded yet." />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel eyebrow="Rule builder" title="Pricing rules" description="Create discounts or flat adjustments per service. Conditions can use simple keys like city=kanpur or userType=startup.">
            <div className="grid gap-3">
              <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Service</span>
                <select
                  value={ruleDraft.serviceCode}
                  onChange={(event) => {
                    const value = event.target.value;
                    setRuleDraft((current) => ({ ...current, serviceCode: value }));
                    setSelectedServiceCode(value);
                  }}
                  className="mt-2 w-full bg-transparent outline-none"
                >
                  {services.map((service) => (
                    <option key={serviceCodeOf(service)} value={serviceCodeOf(service)}>
                      {serviceNameOf(service)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Rule type</span>
                  <select value={ruleDraft.type} onChange={(event) => setRuleDraft((current) => ({ ...current, type: event.target.value }))} className="mt-2 w-full bg-transparent outline-none">
                    <option value="discount">discount (%)</option>
                    <option value="flat">flat (INR)</option>
                    <option value="dynamic">dynamic (INR)</option>
                  </select>
                </label>
                <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Value</span>
                  <input value={ruleDraft.value} onChange={(event) => setRuleDraft((current) => ({ ...current, value: event.target.value }))} className="mt-2 w-full bg-transparent outline-none" inputMode="numeric" />
                </label>
              </div>
              <label className="rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Condition</span>
                <input value={ruleDraft.condition} onChange={(event) => setRuleDraft((current) => ({ ...current, condition: event.target.value }))} className="mt-2 w-full bg-transparent outline-none" placeholder="city=kanpur" />
              </label>
              <label className="flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                <input type="checkbox" checked={ruleDraft.isActive} onChange={(event) => setRuleDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                <span>Rule active</span>
              </label>
              <Button type="button" onClick={() => void handleCreateRule()} disabled={busyCode === "rule-create" || !ruleDraft.serviceCode}>
                {busyCode === "rule-create" ? "Creating..." : "Create pricing rule"}
              </Button>
            </div>
          </Panel>

          <Panel eyebrow="Active rules" title="Rule list" description="Filter follows the selected service so you can check exactly what will affect the final payable amount.">
            {selectedRules.length ? (
              <div className="space-y-3">
                {selectedRules.map((rule) => {
                  const id = String(rule.id ?? "");
                  const active = boolValue(rule.is_active ?? rule.isActive, true);
                  return (
                    <div key={id} className="rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{String(rule.type ?? "discount")} â€¢ {String(rule.value ?? 0)}</p>
                          <p className="mt-1 text-sm text-slate-300">{String(rule.condition ?? "Always on")}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{String(rule.service_code ?? rule.serviceCode ?? "")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={active ? "active" : "inactive"} />
                          <Button type="button" variant="secondary" onClick={() => void handleToggleRule(rule)} disabled={busyCode === id}>
                            {busyCode === id ? "Saving..." : active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No pricing rules" description="Create the first rule to launch a discount, offer, or dynamic adjustment." />
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}