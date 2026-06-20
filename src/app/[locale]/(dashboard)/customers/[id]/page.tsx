"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function CustomerDetailPage() {
  const t = useTranslations("customers");
  const ti = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    Promise.all([
      api.customers.get(id),
      api.invoices.list({ customer: id }),
    ]).then(([cRes, iRes]) => {
      setCustomer(cRes.data);
      setInvoices(iRes.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!customer) return (
    <div className="px-4 sm:px-6 text-center py-20">
      <p className="text-gray-500 dark:text-gray-400">Customer not found</p>
    </div>
  );

  const totalDue = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total || 0), 0);
  const symbol = (c: string) => c === "EUR" ? "€" : c === "DZD" ? "د.ج" : "$";

  return (
    <div className="px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-lg font-semibold text-white">{(customer.name || "C").charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("invoices")}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{invoices.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("totalRevenue")}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{symbol("USD")}{invoices.reduce((s, i) => s + (i.total || 0), 0).toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("amountDue")}</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{symbol("USD")}{totalDue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("status")}</p>
          <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${customer.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
            {customer.status === "active" ? t("active") : t("inactive")}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mb-6 space-y-2 text-sm">
        {customer.phone && <p><span className="text-gray-500 dark:text-gray-400">{t("phone")}:</span> <span className="text-gray-900 dark:text-white">{customer.phone}</span></p>}
        {(customer.address || customer.city || customer.country) && (
          <p><span className="text-gray-500 dark:text-gray-400">{t("address")}:</span> <span className="text-gray-900 dark:text-white">{[customer.address, customer.city, customer.country].filter(Boolean).join(", ")}</span></p>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("invoiceHistory")}</h2>
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{ti("number")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{ti("amount")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{ti("status")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{ti("dueDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {invoices.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500 dark:text-gray-400">{ti("noInvoices")}</td></tr>
              ) : invoices.map((inv) => {
                const cur = inv.currency || "USD";
                const sym = cur === "EUR" ? "€" : cur === "DZD" ? "د.ج" : "$";
                return (
                  <tr key={inv._id} onClick={() => router.push(`/invoices/${inv._id}`)} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                    <td className="px-5 py-3.5 font-medium text-blue-600 dark:text-blue-400">#{inv.invoiceNumber || inv.number}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">{sym}{(inv.total || 0).toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusColor[inv.status] || statusColor.draft}`}>
                        {ti(inv.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
