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
  params: { invoiceId: string };
}) {
  const invoiceId = Number.parseInt(params.invoiceId);
  if (isNaN(invoiceId)) {
    throw new Error('Invalid invoice ID');
  }

  const invoice = await getInvoice(invoiceId);
  if (!invoice) {
    notFound();
  }

  return <Invoice invoice={invoice as InvoiceWithCustomer} />;
}