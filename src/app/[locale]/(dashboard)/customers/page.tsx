"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function CustomersPage() {
  const t = useTranslations("customers");
  const locale = useLocale();
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    api.customers.list().then((res) => {
      setCustomers(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {customers.length} {t("totalCustomers")}
          </p>
        </div>
        <Link href="/customers/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t("newCustomer")}
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="relative">
            <svg className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 ${locale === "ar" ? "right-3" : "left-3"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all ${locale === "ar" ? "pr-10 pl-4" : "pl-10 pr-4"}`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-700/30">
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("name")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("email")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("invoices")}</th>
                <th className={`${locale === "ar" ? "text-right" : "text-left"} px-5 py-3 font-medium text-gray-500 dark:text-gray-400`}>{t("status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <p className="text-gray-500 dark:text-gray-400">{t("noCustomers")}</p>
                      <Link href="/customers/new" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">{t("addFirst")}</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c._id} onClick={() => router.push(`/customers/${c._id}`)} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-sm font-semibold text-white">{(c.name || "C").charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400">{c.email}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-gray-100 dark:bg-slate-700 text-xs font-medium text-gray-600 dark:text-gray-300">
                        {c._count?.invoices ?? c.invoicesCount ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${c.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                        {c.status === "active" ? t("active") : t("inactive")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
