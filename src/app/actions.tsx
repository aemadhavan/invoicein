"use server";
import { db } from "@/db";
import { Inovices } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc,eq,and } from "drizzle-orm";
import { redirect } from "next/navigation";


export async function createInvoice(formData: FormData) {

    const { userId } = await auth();//get the user id from the auth object
    console.log(userId);
    if(!userId) { throw new Error('User not found'); }
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
    // Handle description
    const rawDescription = formData.get('description');
    if (!rawDescription || typeof rawDescription !== 'string') {
        throw new Error('Description is required');
    }
    const description = rawDescription;
    
    const status = 'pending' as const;

    console.log(name, email, amount, description);
    const insertData = {
        amount: amount,
        status: status,
        description: description,
        userId: userId,
    } ;//as const;

    const results = await db.insert(Inovices).values(insertData).returning({id:Inovices.id});  
    //results[0].id;
    redirect(`/invoices/${results[0].id}`);
}

export async function getInvoices() {
    const { userId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }
    const invoices = await db.select().from(Inovices).where(eq(Inovices.userId,userId)).orderBy(desc(Inovices.createTs));
    return invoices;
}

export async function getInvoice(id: number) {
    const { userId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }
    const invoice = await db.select().from(Inovices).where(and(eq(Inovices.id,id),eq(Inovices.userId,userId))).limit(1);
    return invoice;
}
