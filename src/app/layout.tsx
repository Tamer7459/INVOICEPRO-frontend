import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Invoice Pro - Smart Invoicing SaaS",
  description: "Create, manage and send professional invoices in minutes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
