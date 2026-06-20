"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
}

export default function NewInvoicePage() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0, tax: 0 }]);
  const [saving, setSaving] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [currency, setCurrency] = useState("USD");

  const currencySymbols: Record<string, string> = { USD: "$", EUR: "€", DZD: "د.ج" };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) setCurrency(savedCurrency);
    api.company.get().then((res) => { if (res.data?.thankYouMessage) setThankYouMessage(res.data.thankYouMessage); }).catch(() => {});
    api.customers.list().then((res) => setCustomers(res.data || [])).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0, tax: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: any) => {
    const next = [...items];
    (next[i] as any)[field] = field === "description" ? value : Number(value) || 0;
    setItems(next);
  };

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const taxTotal = items.reduce((s, it) => s + it.quantity * it.unitPrice * (it.tax / 100), 0);
  const total = subtotal + taxTotal;

  const handleSave = async () => {
    if (items.length === 0) return;
    if (!customerId && (!isNewCustomer || !newCustomerName || !newCustomerEmail)) return;
    setSaving(true);
    try {
      const payload: any = { dueDate, notes, items, currency, invoiceNumber: invoiceNumber || undefined, thankYouMessage };
      if (customerId) {
        payload.customerId = customerId;
      } else {
        payload.customerName = newCustomerName;
        payload.customerEmail = newCustomerEmail;
      }
      await api.invoices.create(payload);
      toast(t("savedSuccess"));
      router.push("/invoices");
    } catch (e: any) {
      toast(e.message || "Failed to create invoice", "error");
    }
    setSaving(false);
  };

  return (
    <div className="px-4 sm:px-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("newInvoice")}</h1>
      </div>

      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("invoiceNumber")}</label>
            <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-2025-001" className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("customer")}</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => { setIsNewCustomer(false); setCustomerId(""); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${!isNewCustomer ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"}`}>{t("existingCustomer")}</button>
              <button type="button" onClick={() => { setIsNewCustomer(true); setCustomerId(""); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isNewCustomer ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"}`}>{t("newCustomer")}</button>
            </div>
            {isNewCustomer ? (
              <div className="space-y-2">
                <input value={newCustomerName} onChange={(e) => setNewCustomerName(e.target.value)} placeholder={t("name")} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                <input type="email" value={newCustomerEmail} onChange={(e) => setNewCustomerEmail(e.target.value)} placeholder={t("email")} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
              </div>
            ) : (
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                <option value="">--</option>
                {customers.map((c: any) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("dueDate")}</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("thankYouMessage")}</label>
          <textarea value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t("notes")}</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-3 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none" />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t("items")}</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {items.map((item, i) => (
              <div key={i} className="p-4 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 sm:col-span-5">
                  {i === 0 && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("description")}</label>}
                  <input value={item.description} onChange={(e) => updateItem(i, "description", e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  {i === 0 && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("qty")}</label>}
                  <input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  {i === 0 && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("price")}</label>}
                  <input type="number" min={0} step={0.01} value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  {i === 0 && <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("tax")}</label>}
                  <input type="number" min={0} max={100} value={item.tax} onChange={(e) => updateItem(i, "tax", e.target.value)} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white" />
                </div>
                <div className="col-span-3 sm:col-span-1 flex justify-end">
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-slate-700">
            <button onClick={addItem} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">+ {t("addItem")}</button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>{t("subtotal")}</span>
            <span>{currencySymbols[currency]}{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
            <span>{t("taxTotal")}</span>
            <span>{currencySymbols[currency]}{taxTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
            <span>{t("grandTotal")}</span>
            <span>{currencySymbols[currency]}{total.toFixed(2)}</span>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || (!customerId && (!isNewCustomer || !newCustomerName || !newCustomerEmail))} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? t("saving") : t("save")}
        </button>
      </div>
    </div>
  );
}
