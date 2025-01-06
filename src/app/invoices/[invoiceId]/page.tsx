import { notFound } from "next/navigation";
import { getInvoice } from "@/app/actions";
import Invoice from "./invoice";
import { Customers, Invoices } from "@/db/schema";

type InvoiceWithCustomer = typeof Invoices.$inferSelect & {
  customer: typeof Customers.$inferSelect;
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoiceId_num = Number.parseInt(invoiceId);
  
  if (isNaN(invoiceId_num)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await getInvoice(invoiceId_num);
  if (!invoice) {
    notFound();
  }

  return <Invoice invoice={invoice as InvoiceWithCustomer} />;
}