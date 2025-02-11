import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";
import Container from "@/components/Container";
import { getInvoice4Payment, payInvoice, updateInvoice } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import Stripe from "stripe";

interface PaymentPageProps {
  params: Promise<{ invoiceId: string }>;
  searchParams: Promise<{ 
    paymentStatus?: string; 
    session_id?: string;
  }>;
}

const stripe = new Stripe(process.env.STRIPE_API_SECRET || '');

export default async function PaymentPage({ params, searchParams }: PaymentPageProps) {   
  const { invoiceId } = await params;
  const { paymentStatus, session_id } = await searchParams;

  const invoiceId_num = Number.parseInt(invoiceId);
  if (isNaN(invoiceId_num)) {
    notFound();
  }

  // Extract and validate search params
  const paymentSuccessRequested = paymentStatus === 'success';
  const hasValidSession = Boolean(session_id && session_id.length > 0);

  // Set initial states
  let isSuccess = false;
  const isCanceled = paymentStatus === 'canceled';
  let isError = paymentSuccessRequested && !hasValidSession;
  
  // Handle successful payment flow
  if (paymentSuccessRequested && hasValidSession && session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid') {
        isSuccess = true;
        const formData = new FormData();
        formData.append('id', invoiceId_num.toString());
        formData.append('status', 'paid');
        formData.append('redirect', 'true');

        await updateInvoice(formData);
      } else {
        isError = true;
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      isError = true;
    }
  }

  // Fetch invoice details
  const invoice = await getInvoice4Payment(invoiceId_num);
  if (!invoice) {
    notFound();
  }

  return (
    <main className="h-full">
      <Container>
        {isSuccess && (
          <p className="bg-green-100 text-sm text-green-800 text-center px-3 py-2 rounded-lg mb-6">
            Payment successful! Your invoice has been marked as paid.
          </p>
        )}
        {isError && (
          <p className="bg-red-100 text-sm text-red-800 text-center px-3 py-2 rounded-lg mb-6">
            Something went wrong, please try again!
          </p>
        )}
        {isCanceled && (
          <p className="bg-yellow-100 text-sm text-yellow-800 text-center px-3 py-2 rounded-lg mb-6">
            Payment was canceled, please try again.
          </p>
        )}
        <div className="flex justify-between mb-6">
          <div>
            <div className="flex justify-between mb-8">            
              <h1 className="flex items-center gap-4 text-3xl font-bold">
                Invoice # {invoiceId_num}
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
          </div>
          <div>
            <h2 className="font-bold text-xl mb-4">Manage Invoice</h2>
            {invoice.status === 'pending' && (
              <form action={payInvoice} method="post" className="grid gap-4">
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <Button className="flex items-center gap-2 font-bold bg-green-700">
                  <CreditCard className="w-5 h-auto" />
                  Pay Invoice
                </Button>
              </form>
            )}
            {invoice.status === 'paid' && (
              <p className="flex items-center gap-2 font-bold">
                <Check className="w-8 h-auto bg-green-500 rounded-full text-white p-1" />
                Invoice Paid
              </p>
            )}
          </div>
        </div>
        
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
            <span>{invoice.customer.name}</span>
          </li>
        </ul>
      </Container>
    </main>
  );
}