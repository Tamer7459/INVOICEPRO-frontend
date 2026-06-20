"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import { useSubscription } from "@/lib/subscription-context";
import ConfirmDialog from "@/components/confirm-dialog";

export default function InvoiceDetailPage() {
  const t = useTranslations("invoices");
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id as string;
  const [invoice, setInvoice] = useState<any>(null);
  const [company, setCompany] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteDialog, setDeleteDialog] = useState(false);
  const { subscription } = useSubscription();
  const hasWhatsApp = subscription?.planId !== "free";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "/login"; return; }
    Promise.all([
      api.invoices.get(id),
      api.company.get().catch(() => ({ data: {} })),
    ]).then(([invRes, compRes]) => {
      setInvoice(invRes.data);
      setCompany(compRes.data || {});
      setEditData({
        taxRate: invRes.data.taxRate || 0,
        salesTax: invRes.data.salesTax || 0,
        otherCharges: invRes.data.otherCharges || 0,
        contactInfo: invRes.data.contactInfo || "",
        paymentInfo: invRes.data.paymentInfo || "",
        thankYouMessage: invRes.data.thankYouMessage || "",
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    try {
      const res = await api.invoices.updateStatus(id, status);
      setInvoice(res.data);
      toast(t("updatedSuccess"));
    } catch (e: any) { toast(e.message || "Failed", "error"); }
  };

  const handleDelete = async () => {
    setDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setDeleteDialog(false);
    try {
      await api.invoices.delete(id);
      toast(t("deletedSuccess"));
      router.push("/invoices");
    } catch (e: any) { toast(e.message || "Failed", "error"); }
  };

  const handleSave = async () => {
    try {
      const res = await api.invoices.update(id, editData);
      setInvoice(res.data);
      setEditMode(false);
      toast(t("updatedSuccess"));
    } catch (e: any) { toast(e.message || "Failed", "error"); }
  };


  const handleSendEmail = async () => {
    try {
      const res = await api.invoices.sendEmail(id);
      const msg = locale === "ar" ? "تم الإرسال بالبريد!" : locale === "fr" ? "Envoyé par email !" : "Sent via email!";
      if ((res as any).previewUrl) {
        toast(`${msg} Preview: ${(res as any).previewUrl}`);
      } else {
        toast(msg);
      }
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const res = await api.invoices.sendWhatsApp(id);
      const msg = locale === "ar" ? "تم الإرسال عبر واتساب!" : locale === "fr" ? "Envoyé via WhatsApp !" : "Sent via WhatsApp!";
      toast(msg);
      if ((res as any).url) window.open((res as any).url, "_blank");
    } catch (e: any) {
      toast(e.message || "Failed", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!invoice) return (
    <div className="px-4 sm:px-6 text-center py-20">
      <p className="text-gray-500 dark:text-gray-400">Invoice not found</p>
    </div>
  );

  const statusColor: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800", sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
  };
  const statusLabel: Record<string, string> = {
    draft: "DRAFT", sent: "SENT", paid: "PAID", overdue: "OVERDUE",
  };

  const itemsSubtotal = (invoice.items || []).reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0);
  const itemsTax = (invoice.items || []).reduce((s: number, it: any) => s + it.quantity * it.unitPrice * ((it.tax || it.taxRate || 0) / 100), 0);
  const cur = invoice.currency || "USD";
  const symbol = cur === "EUR" ? "€" : cur === "DZD" ? "د.ج" : "$";
  const customer = invoice.customerId || {};
  const logoUrl = company.logo && !company.logo.startsWith("http") ? `http://localhost:4000${company.logo}` : company.logo;
  const grandTotal = itemsSubtotal + itemsTax + (editMode ? (Number(editData.salesTax) || 0) + (Number(editData.otherCharges) || 0) : (invoice.salesTax || 0) + (invoice.otherCharges || 0));

  return (
    <div className="px-4 sm:px-6 max-w-5xl">
      {/* Top Header */}
      <div className="mb-4 print:hidden">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors mb-2">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Invoice for {customer.name || "N/A"} {symbol}{grandTotal.toFixed(2)} &bull; Status: {statusLabel[invoice.status] || "DRAFT"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 print:hidden">
        <button onClick={() => api.invoices.downloadPdf(id, `invoice-${invoice.invoiceNumber}.pdf`).catch((e: any) => toast(e.message, "error"))} className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Download PDF
        </button>
        <button onClick={handleSendEmail} className="px-4 py-2.5 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors flex items-center gap-2 shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Send Via Mail
        </button>
        {hasWhatsApp && (
          <button onClick={handleSendWhatsApp} className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            {t("sendWhatsApp")}
          </button>
        )}
        {editMode ? (
          <>
            <button onClick={handleSave} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Save Changes
            </button>
            <button onClick={() => setEditMode(false)} className="px-4 py-2.5 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Edit Mode
          </button>
        )}
      </div>

      {/* Invoice Document */}
      <div className="print-invoice bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
        {/* Black Header */}
        <div className="bg-gray-900 text-white px-6 sm:px-8 py-6 flex items-center justify-between">
          <div>
            {logoUrl && <img src={logoUrl} alt="Logo" className="h-10 mb-2 rounded" />}
            <p className="text-sm text-gray-300">{company.companyName || ""}</p>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-wide">INVOICE</h2>
        </div>

        {/* Company + Invoice Info */}
        <div className="px-6 sm:px-8 py-6 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">{locale === "ar" ? "عنوان الشركة" : "Company Address"}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{company.companyName || ""}</p>
            {company.address && <p className="text-sm text-gray-600 dark:text-gray-400">{company.address}</p>}
            {company.phone && <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {company.phone}</p>}
            {company.taxNumber && <p className="text-sm text-gray-600 dark:text-gray-400">Tax: {company.taxNumber}</p>}
          </div>
          <div className={`sm:text-right`}>
            <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "التاريخ:" : "Date:"}</span> <span className="font-medium text-gray-900 dark:text-white">{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "-"}</span></p>
            <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "رقم الفاتورة:" : "Invoice #:"}</span> <span className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</span></p>
            <p className="text-sm"><span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "رقم العميل:" : "Customer ID:"}</span> <span className="font-medium text-gray-900 dark:text-white">{customer._id ? customer._id.toString().slice(-6).toUpperCase() : "-"}</span></p>
          </div>
        </div>

        {/* Bill To + Due Date */}
        <div className="px-6 sm:px-8 pb-6 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-1">{locale === "ar" ? "فاتورة إلى" : "Bill To"}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{customer.name || "-"}</p>
            {customer.email && <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>}
            {customer.phone && <p className="text-sm text-gray-600 dark:text-gray-400">Phone: {customer.phone}</p>}
            {(customer.address || customer.city || customer.country) && (
              <p className="text-sm text-gray-600 dark:text-gray-400">Location: {[customer.address, customer.city, customer.country].filter(Boolean).join(", ")}</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-sm mt-4 sm:mt-0">
              <span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "تاريخ الاستحقاق:" : "Invoice Due Date:"}</span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "-"}</span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-6 sm:px-8 pb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-4 py-3 text-left font-semibold">{t("qty")}</th>
                <th className="px-4 py-3 text-left font-semibold">{t("description")}</th>
                <th className="px-4 py-3 text-right font-semibold">{locale === "ar" ? "سعر الوحدة" : "Unit Price"}</th>
                <th className="px-4 py-3 text-right font-semibold">{locale === "ar" ? "خاضع للضريبة" : "Taxable?"}</th>
                <th className="px-4 py-3 text-right font-semibold">{locale === "ar" ? "المبلغ" : "Amount"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {(invoice.items || []).map((item: any, i: number) => {
                const itemTaxable = (item.tax || item.taxRate || 0) > 0;
                const amount = item.quantity * item.unitPrice * (1 + (item.tax || item.taxRate || 0) / 100);
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50 dark:bg-slate-700/20" : ""}>
                    <td className="px-4 py-3 text-gray-900 dark:text-white text-center">{item.quantity}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{item.description}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{symbol}{item.unitPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{itemTaxable ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">{symbol}{amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 sm:px-8 pb-6">
          <div className="sm:w-96 sm:ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
              <span className="font-medium text-gray-900 dark:text-white">{symbol}{itemsSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "نسبة الضريبة" : "Tax Rate"}</span>
              {editMode ? (
                <input type="number" value={editData.taxRate} onChange={(e) => setEditData({ ...editData, taxRate: Number(e.target.value) })} className="w-20 text-right border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:bg-slate-700 dark:text-white" />
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">{invoice.taxRate || 0}%</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "ضريبة المبيعات" : "Sales Tax"}</span>
              {editMode ? (
                <input type="number" value={editData.salesTax} onChange={(e) => setEditData({ ...editData, salesTax: Number(e.target.value) })} className="w-24 text-right border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:bg-slate-700 dark:text-white" />
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">{symbol}{(invoice.salesTax || 0).toFixed(2)}</span>
              )}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">{locale === "ar" ? "رسوم أخرى" : "Other"}</span>
              {editMode ? (
                <input type="number" value={editData.otherCharges} onChange={(e) => setEditData({ ...editData, otherCharges: Number(e.target.value) })} className="w-24 text-right border border-gray-300 dark:border-slate-600 rounded px-2 py-1 text-sm dark:bg-slate-700 dark:text-white" />
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">{symbol}{(invoice.otherCharges || 0).toFixed(2)}</span>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-slate-600 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white text-lg">{locale === "ar" ? "الإجمالي" : "TOTAL"}</span>
                <span className="bg-gray-900 text-white px-4 py-1.5 rounded font-bold text-lg">{symbol}{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{locale === "ar" ? "معلومات التذييل" : "Footer Info"}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{locale === "ar" ? "معلومات الاتصال" : "Contact Info"}</label>
            {editMode ? (
              <textarea value={editData.contactInfo} onChange={(e) => setEditData({ ...editData, contactInfo: e.target.value })} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white resize-none" placeholder={locale === "ar" ? "معلومات الاتصال..." : "Contact info..."} />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                {invoice.contactInfo || (locale === "ar" ? "لا توجد معلومات اتصال" : "No contact info set")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{locale === "ar" ? "معلومات الدفع" : "Payment Info"}</label>
            {editMode ? (
              <textarea value={editData.paymentInfo} onChange={(e) => setEditData({ ...editData, paymentInfo: e.target.value })} rows={2} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white resize-none" placeholder={locale === "ar" ? "معلومات الدفع..." : "Payment info..."} />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                {invoice.paymentInfo || (locale === "ar" ? "لا توجد معلومات دفع" : "No payment info set")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{locale === "ar" ? "رسالة الشكر" : "Thank You Message"}</label>
            {editMode ? (
              <input type="text" value={editData.thankYouMessage} onChange={(e) => setEditData({ ...editData, thankYouMessage: e.target.value })} className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm dark:bg-slate-700 dark:text-white" placeholder={locale === "ar" ? "رسالة شكر..." : "Thank you message..."} />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
                {invoice.thankYouMessage || (locale === "ar" ? "لا توجد رسالة شكر" : "No thank you message set")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <div className="mt-6 flex flex-wrap gap-2 print:hidden">
        {invoice.status === "draft" && (
          <button onClick={() => updateStatus("sent")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">{t("markSent")}</button>
        )}
        {(invoice.status === "sent" || invoice.status === "overdue") && (
          <button onClick={() => updateStatus("paid")} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">{t("markPaid")}</button>
        )}
        <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">{t("delete")}</button>
      </div>
      <ConfirmDialog
        open={deleteDialog}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
}
