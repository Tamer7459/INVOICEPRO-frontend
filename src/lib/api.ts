const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function req<T>(endpoint: string, opts: any = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isFormData = opts.body instanceof FormData;
  const headers: Record<string, string> = { ...opts.headers };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${endpoint}`, { method: opts.method || "GET", headers, body: isFormData ? opts.body : (opts.body ? JSON.stringify(opts.body) : undefined) });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  auth: {
    googleLogin: (d: any) => req<{ success: boolean; data: { token: string; user: any } }>("/auth/google", { method: "POST", body: d }),
    me: () => req<{ success: boolean; data: any }>("/auth/me"),
  },
  invoices: {
    list: (p?: Record<string, string>) => req<{ success: boolean; data: any[]; meta: any }>(`/invoices?${new URLSearchParams(p || {}).toString()}`),
    get: (id: string) => req<{ success: boolean; data: any }>(`/invoices/${id}`),
    create: (d: any) => req<{ success: boolean; data: any }>("/invoices", { method: "POST", body: d }),
    update: (id: string, d: any) => req<{ success: boolean; data: any }>(`/invoices/${id}`, { method: "PATCH", body: d }),
    delete: (id: string) => req<{ success: boolean }>(`/invoices/${id}`, { method: "DELETE" }),
    updateStatus: (id: string, status: string) => req<{ success: boolean; data: any }>(`/invoices/${id}/status`, { method: "PATCH", body: { status } }),
    syncOverdue: () => req<{ success: boolean; modifiedCount: number }>("/invoices/sync-overdue", { method: "PATCH" }),
    downloadPdf: async (id: string, filename?: string) => {
      const token = localStorage.getItem("token");
      const isPreview = id.startsWith("preview/");
      const url = isPreview ? `${BASE}/invoices/${id}` : `${BASE}/invoices/${id}/pdf?template=${localStorage.getItem("invoiceTemplate") || "modern"}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to download PDF");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename || `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    },
    sendEmail: (id: string) => req<{ success: boolean; message: string }>(`/invoices/${id}/send`, { method: "POST" }),
    sendWhatsApp: (id: string) => req<{ success: boolean; message: string; url?: string }>(`/invoices/${id}/whatsapp`, { method: "POST" }),
  },
  customers: {
    list: (p?: Record<string, string>) => req<{ success: boolean; data: any[]; meta: any }>(`/customers?${new URLSearchParams(p || {}).toString()}`),
    get: (id: string) => req<{ success: boolean; data: any }>(`/customers/${id}`),
    create: (d: any) => req<{ success: boolean; data: any }>("/customers", { method: "POST", body: d }),
  },
  subscriptions: {
    plans: () => req<{ success: boolean; data: any[] }>("/subscriptions/plans"),
    current: () => req<{ success: boolean; data: any }>("/subscriptions/current"),
    checkout: (d: any) => req<{ success: boolean; data: { url: string } }>("/subscriptions/checkout", { method: "POST", body: d }),
    activate: (planId: string, confirmed?: boolean) => req<{ success: boolean; data: any }>("/subscriptions/activate", { method: "POST", body: { planId, confirmed: confirmed || false } }),
  },
  admin: {
    stats: () => req<{ success: boolean; data: any }>("/admin/stats"),
  },
  company: {
    get: () => req<{ success: boolean; data: any }>("/company"),
    update: (d: any) => {
      if (d instanceof FormData) return req<{ success: boolean; data: any }>("/company", { method: "PATCH", body: d, headers: {} });
      return req<{ success: boolean; data: any }>("/company", { method: "PATCH", body: d });
    },
  },
};
