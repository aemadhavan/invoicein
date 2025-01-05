
"use client";
import { useOptimistic } from "react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils";
import Container from "@/components/Container";
import {AVAILABLE_STATUSES} from "@/data/invoices";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button";
import { updateInvoice,deleteInvoice } from "@/app/actions";
import { ChevronDown, CreditCard, Ellipsis, Trash2 } from "lucide-react";
import type { Customers, Invoices } from "@/db/schema";
import Link from "next/link";

interface InvoiceProps {
    invoice: typeof Invoices.$inferSelect & {
      customer: typeof Customers.$inferSelect;
    };
}
export default  function Invoice({invoice}:InvoiceProps) {  
  const [currentStatus, setCurrentStatus] = useOptimistic(
                                              invoice.status, (state:string, newStatus:string) => 
                                                {
                                                    return String(newStatus)
                                                });  

  const invoiceId = Number.parseInt(invoice.id.toString());
  if(isNaN(invoiceId)) {
    throw new Error('Invalid invoice ID');
  }
  

  if(!invoice) {
    notFound();
  }
  
  async function handleOnUpdateStatus(formData: FormData) {    
    const originalStatus = currentStatus;
    try {
      setCurrentStatus(formData.get('status') as string);
      await updateInvoice(formData);
    } catch {
      setCurrentStatus(originalStatus);
    }
  }
  async function handleOnDelete(formData: FormData) {
    await deleteInvoice(formData);
    console.log('Delete attempt:', formData.get('id'));
  }
  console.log(invoice);
  return (
    <main className="h-full">
      <Container>
        <div className="flex justify-between mb-8">            
            <h1 className="flex items-center gap-4 text-3xl font-bold">
              Invoice # {invoiceId}
              <Badge className={cn("rounded-full capitalize",
                currentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                currentStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              )}>{currentStatus}</Badge>
            </h1>   
            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant={"outline"} type="button">Change Status <ChevronDown/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>   
                  {
                    AVAILABLE_STATUSES.map((status) => {
                    return <DropdownMenuItem key={status.id}>
                              <form action={handleOnUpdateStatus}>
                                <input type="hidden" name="id" value={invoice.id} />
                                <input type="hidden" name="status" value={status.id} />
                                <input type="hidden" name="redirect" value={'true'} />
                                <button type="submit">{status.label}</button>
                              </form>
                          </DropdownMenuItem>})     
                  }         
                </DropdownMenuContent>
              </DropdownMenu> 
              <Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant={"outline"} type="button">
                      <span className="sr-only">More Options</span>
                      <Ellipsis className="w-4 h-auto" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                      <DropdownMenuItem>
                      <DialogTrigger asChild>
                          <button type="submit" className="flex items-center gap-2">
                              <Trash2 className="w-4 h-auto mr-2"/>
                              Delete Invoice
                          </button>
                      </DialogTrigger>                          
                      </DropdownMenuItem>

                      <DropdownMenuItem>
                      <DialogTrigger>
                          <Link href={`/invoices/${invoice.id}/payment`} className="flex items-center gap-2">
                              <CreditCard className="w-4 h-auto mr-2"/>
                              Payment Invoice
                          </Link>
                      </DialogTrigger>                          
                      </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>                
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Invoice?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your invoice
                      and remove your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                      <form action={handleOnDelete}>
                          <input type="hidden" name="id" value={invoice.id} />
                          <Button variant="destructive" className="flex items-center gap-2">
                              <Trash2 className="w-4 h-auto mr-2"/>
                              Delete Invoice
                          </Button>
                      </form>
                  </DialogFooter>
                </DialogContent>
            </Dialog>

               
            </div>
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
            <span>{invoice.customer.name}</span>
          </li>
          <li className="flex gap-4">
            <strong className="block w-28 flex-shrink-0 font-medium text-sm">
              Billing Email
            </strong>
            <span>{invoice.customer.email}</span>
          </li>
        </ul>
      </Container>
    </main>
  );  
}