import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { CirclePlus } from 'lucide-react';
import Link from "next/link";
import { getInvoices } from "@/app/actions";
import { cn } from "@/lib/utils";
import Container from "@/components/Container";



export default async function Dashboard() {
  const invoices = await getInvoices();

  return (
    <main className="h-full my-12">
        <Container>
            <div className="flex justify-between">            
                <h1 className="text-3xl font-bold">Invoices</h1> 
                <p>
                    <Button variant="ghost" className="inline-flex gap-4" asChild><Link href="invoices/new"><CirclePlus className="h-4 w-4"/>Create Invoice</Link></Button>
                </p>    
            </div>      
            <Table>
                <TableCaption>A list of your recent invoices.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px] p-4">Dates</TableHead>
                        <TableHead className="p-4">Customer</TableHead>
                        <TableHead className="p-4">Email</TableHead>
                        <TableHead className="text-center p-4">Status</TableHead>
                        <TableHead className="text-right p-4">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>                    
                            <TableCell className="font-medium text-left p-0">
                                <Link className="block p-4" href={`/invoices/${invoice.id}`}><span className="font-semibold">{new Date(invoice.createTs).toLocaleDateString()}</span></Link>
                            </TableCell>
                            <TableCell className="text-left p-0">
                                <Link className="block p-4" href={`/invoices/${invoice.id}`}><span className="font-semibold">{"Codesole"}</span></Link>
                            </TableCell>
                            <TableCell className="text-left p-0">
                                <Link className="block p-4" href={`/invoices/${invoice.id}`}><span>{"codesoles@gmail.com"}</span></Link>
                            </TableCell>
                            <TableCell className="text-center p-0">
                                <Link className="block p-4" href={`/invoices/${invoice.id}`}><span className="font-semibold"><Badge className={cn("rounded-full capitalize",
                                                invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                                'bg-gray-100 text-gray-800'
                                            )}>{invoice.status}</Badge></span></Link>
                            </TableCell>
                            <TableCell className="text-right p-0">
                                <Link className="block p-4" href={`/invoices/${invoice.id}`}><span className="font-semibold">${(invoice.amount/100).toFixed(2)}</span></Link>
                            </TableCell>
                        </TableRow>
                        
                    ))}
                </TableBody>
            </Table>
        </Container>
    </main>
  );
}