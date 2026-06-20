"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const [stats, setStats] = useState({ total: 0, revenue: 0, paid: 0, overdue: 0, collected: 0, uncollected: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) setCurrency(savedCurrency);
    api.invoices.syncOverdue().catch(() => {});
    Promise.all([
      api.invoices.list({ limit: "5" }),
      api.invoices.list({}),
      api.company.get().catch(() => null),
    ]).then(([recentRes, allRes, companyRes]) => {
      setRecent(recentRes.data || []);
      setCompany(companyRes?.data || null);
      const all = allRes.data || [];
      setStats({
        total: allRes.meta?.total || all.length,
        revenue: all.reduce((s: number, i: any) => s + (i.total || 0), 0),
        paid: all.filter((i: any) => i.status === "paid").length,
        overdue: all.filter((i: any) => i.status === "overdue").length,
        collected: all.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total || 0), 0),
        uncollected: all.filter((i: any) => i.status !== "paid").reduce((s: number, i: any) => s + (i.total || 0), 0),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const symbol = currency === "EUR" ? "€" : currency === "DZD" ? "د.ج" : "$";

  const statCards = [
    { label: t("totalInvoices"), value: stats.total, color: "blue" },
    { label: t("totalRevenue"), value: `${symbol}${stats.revenue.toFixed(2)}`, color: "green" },
    { label: t("collectedRevenue"), value: `${symbol}${stats.collected.toFixed(2)}`, color: "emerald" },
    { label: t("uncollectedRevenue"), value: `${symbol}${stats.uncollected.toFixed(2)}`, color: "orange" },
    { label: t("paidInvoices"), value: stats.paid, color: "emerald" },
    { label: t("overdueInvoices"), value: stats.overdue, color: "red" },
  ];

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusDot: Record<string, string> = {
    draft: "bg-gray-500",
    sent: "bg-blue-500",
    paid: "bg-green-500",
    overdue: "bg-red-500",
  };

  return (
    <div className="px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      </div>

      {company && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 mb-6 overflow-hidden">
          <div className="p-6 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-600 overflow-hidden">
                {company.logo ? (
                  <img src={company.logo.startsWith("http") ? company.logo : `http://localhost:4000${company.logo}`} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{company.companyName || t("title")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {company.companyName || "Company"}
                </p>
                <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {t("activeAccount")}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/settings" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                {t("editCompany")}
              </Link>
              <Link href="/invoices/new" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                {t("newInvoice")}
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 px-6 py-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              {t("contactInformation")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {company.phone && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("phone")}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{company.phone}</p>
                  </div>
                </div>
              )}
              {company.address && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("location")}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{company.address}</p>
                  </div>
                </div>
              )}
              {company.taxNumber && (
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 py-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t("taxNumber")}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{company.taxNumber}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-700 px-6 py-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{t("companySince")}: {new Date(company.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            <span>{t("lastUpdated")}: {new Date(company.updatedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentInvoices")}</h2>
            <Link href="/invoices" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{t("viewAll")}</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {recent.length === 0 ? (
              <p className="p-5 text-sm text-gray-500 dark:text-gray-400">{t("noInvoices")}</p>
            ) : (
              recent.map((inv: any) => (
                <Link key={inv._id} href={`/invoices/${inv._id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">#{inv.invoiceNumber || inv.number}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{inv.customerId?.name || inv.customer?.name || "-"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{symbol}{(inv.total || 0).toFixed(2)}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusColor[inv.status] || statusColor.draft}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[inv.status] || statusDot.draft}`} />
                      {t(inv.status)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("quickActions")}</h2>
          <div className="space-y-3">
            <Link href="/invoices/new" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              {t("createInvoice")}
            </Link>
            <Link href="/customers/new" className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              {t("addCustomer")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
