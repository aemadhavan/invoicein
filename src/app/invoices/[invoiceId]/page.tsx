
import { notFound } from "next/navigation";
import { getInvoice } from "@/app/actions";
import { updateInvoice } from "@/app/actions";
import Invoice from "./invoice";


export default async function InvoicePage({params}:{params: {invoiceId: string}}) {  
  const awaitedParams = await params;    
  const invoiceId = Number.parseInt(awaitedParams.invoiceId);
  if(isNaN(invoiceId)) {
    throw new Error('Invalid invoice ID');
  }
  const [invoice] = await getInvoice(invoiceId);

  if(!invoice) {
    notFound();
  }
  
  async function handleOnUpdateStatus(formData: FormData) {    
    try {
      await updateInvoice(formData);
    } catch {
      //setCurrentStatus(originalStatus);
    }
  }
  console.log(invoice);
  return (
    <Invoice invoice={invoice} />
  );  
}