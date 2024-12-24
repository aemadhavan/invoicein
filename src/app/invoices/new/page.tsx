
import {sql} from 'drizzle-orm';
import {db} from '@/db';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default async function CreateInvoicePage() {
    async function createInvoice(fromData: FormData) {
        "use server";
        console.log(fromData);
        //const request = await db.execute(sql`SELECT current_database()`);
    }

  return (
    <main className="flex flex-col justify-center h-full gap-6 max-w-5xl mx-auto my-12">
        <div className="flex justify-between">            
            <h1 className="text-3xl font-bold">Create a new Invoice</h1>    
        </div>
       
        <form action={createInvoice} className="grid gap-4 max-w-sm">
            <div>
                <Label htmlFor="name" className="block mb-2 font-semibold text-sm">Billing Name</Label>
                <Input name="name" id="name" type="text" />
            </div>
            <div>
                <Label htmlFor="email" className="block mb-2 font-semibold text-sm">Billing Email</Label>
                <Input name="email" id="email" type="email" />
            </div>
            <div>
                <Label htmlFor="amount" className="block mb-2 font-semibold text-sm">Amount</Label>
                <Input name="amount" id="amount" type="number" />
            </div>
            <div>
                <Label htmlFor="description" className="block mb-2 font-semibold text-sm">Description</Label>
                <Textarea name="description" id="description" />
            </div>
            <div>
                <Button type="submit" className="w-full font-semibold">Create Invoice</Button>
            </div>            
        </form>
    </main>
  );
}