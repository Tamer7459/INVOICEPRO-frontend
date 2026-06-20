"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

function InvoicesContent() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const filter = searchParams.get("status") || "all";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    api.invoices.syncOverdue().catch(() => {});
    setLoading(true);
    const params: Record<string, string> = {};
    if (filter !== "all") params.status = filter;
    api.invoices.list(params).then((res) => {
      setInvoices(res.data || []);
      setLoading(false);
    }).catch(() => { setInvoices([]); setLoading(false); });
  }, [filter]);

  const filters = ["all", "draft", "sent", "paid", "overdue"];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{invoices.length} {t("title")}</p>
        </div>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t("newInvoice")}
        </Link>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => router.push(f === "all" ? "/invoices" : `/invoices?status=${f}`)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {t(f)}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("number")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("customer")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("amount")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("status")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("dueDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">{t("noInvoices")}</p>
                      <Link href="/invoices/new" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">{t("createFirst")}</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const num = inv.invoiceNumber || inv.number || "—";
                  const customerName = inv.customerId?.name || inv.customer?.name || "—";
                  const cur = inv.currency || "USD";
                  const symbol = cur === "EUR" ? "€" : cur === "DZD" ? "د.ج" : "$";
                  return (
                    <tr key={inv._id} onClick={() => router.push(`/invoices/${inv._id}`)} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-blue-600 dark:text-blue-400">#{num}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
                            <span className="text-xs font-semibold text-white">{customerName.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{customerName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">{symbol}{(inv.total || 0).toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusColor[inv.status] || statusColor.draft}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[inv.status] || statusDot.draft}`} />
                          {t(inv.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <InvoicesContent />
    </Suspense>
  );
}
