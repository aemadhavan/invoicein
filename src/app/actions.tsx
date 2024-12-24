"use server";
import { db } from "@/db";
import { Inovices } from "@/db/schema";
import { redirect } from "next/navigation";


export async function createInvoice(formData: FormData) {
    console.log(formData);
    const name = formData.get('name');
    const email = formData.get('email');
    //const amount = Number.parseFloat(String(fromData.get('amount'))) * 100;
    const rawAmount = formData.get('amount');
    if(!rawAmount) { throw new Error('Invalid amount'); }
    const amountValue = Number.parseFloat(rawAmount.toString())     
    if (isNaN(amountValue)) {
        throw new Error('Invalid amount');
    }
    const amount= Math.round(amountValue * 100);
    const description = formData.get('description');
    const status = 'pending' as const;
    console.log(name, email, amount, description);
    const results = await db.insert(Inovices).values({amount,status,description }).returning({id:Inovices.id});  
    results[0].id;
    redirect(`/invoices/${results[0].id}`);
}