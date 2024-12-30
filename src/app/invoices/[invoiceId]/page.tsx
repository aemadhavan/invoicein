import { notFound } from "next/navigation";
import { getInvoice } from "@/app/actions";
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";
import { not } from "drizzle-orm";
import Container from "@/components/Container";

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

  console.log(invoice);
  return (
    <main className="h-full2">
      <Container>
        <div className="flex justify-between mb-8">            
            <h1 className="flex items-center gap-4 text-3xl font-bold">
              Invoice # {invoiceId}
              <Badge className={cn("rounded-full capitalize",
                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              )}>{invoice.status}</Badge>
            </h1>    
        </div>
        <p className="text-3xl mb-3">${(invoice.amount / 100).toFixed(2)}</p> 
        <p className="text-lg mb-8">{invoice.description}</p>
        <h2 className="font-bold text-lg mb-4">Billing Details</h2>
        <ul className="grid gap-2">
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice ID
            </strong>
            <span>{invoice.id}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Invoice Date
            </strong>
            <span>{new Date(invoice.createTs).toLocaleDateString()}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Name
            </strong>
            <span>{}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Email
            </strong>
            <span>{}</span>
          </li>
        </ul>
      </Container>
    </main>
  );  
}