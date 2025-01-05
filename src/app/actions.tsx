"use server";
import { db } from "@/db";
import { Invoices } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc,eq,and } from "drizzle-orm";
import { redirect } from "next/navigation";
// Define valid status types
type InvoiceStatus = "pending" | "paid" | "cancelled";

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

    const results = await db.insert(Invoices).values(insertData).returning({id:Invoices.id});  
    //results[0].id;
    redirect(`/invoices/${results[0].id}`);
}

export async function updateInvoice(formData: FormData) {
    const { userId } = await auth();
    if (!userId) { 
        throw new Error('User not found'); 
    }

    const id = Number(formData.get('id'));
    const statusValue = formData.get('status');
    
    // Debug logging
    console.log('Update attempt:', { id, status: statusValue, userId });
    
    if (!statusValue) {
        throw new Error('Status is required');
    }
    
    const rawStatus = statusValue.toString();
    
    if (!isValidStatus(rawStatus)) {
        throw new Error('Invalid status value');
    }

    const status: InvoiceStatus = rawStatus;
    const updateData = { status };

    const results = await db.update(Invoices)
        .set(updateData)
        .where(and(
            eq(Invoices.id, id),
            eq(Invoices.userId, userId)
        ))
        .returning({ id: Invoices.id });  

    // Debug logging
    console.log('Update results:', results);

    // Check if we got any results
    if (!results.length) {
        throw new Error(`No invoice found with id ${id} for user ${userId}`);
    }

    redirect(`/invoices/${results[0].id}`);
}
export async function deleteInvoice(formData: FormData) {
    const { userId } = await auth();
    if (!userId) { 
        throw new Error('User not found'); 
    }

    const id = Number(formData.get('id'));
 
    const results = await db.delete(Invoices)        
        .where(and(
            eq(Invoices.id, id),
            eq(Invoices.userId, userId)
        ))
       

    // Debug logging
    console.log('Update results:', results);

    // Check if we got any results
    if (!results) {
        throw new Error(`No invoice found with id ${id} for user ${userId}`);
    }

    redirect(`/dashboard/`);
}
export async function getInvoices() {
    const { userId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }
    const invoices = await db.select().from(Invoices).where(eq(Invoices.userId,userId)).orderBy(desc(Invoices.createTs));
    return invoices;
}

export async function getInvoice(id: number) {
    const { userId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }
    const invoice = await db.select().from(Invoices).where(and(eq(Invoices.id,id),eq(Invoices.userId,userId))).limit(1);
    return invoice;
}

// Type guard function
function isValidStatus(status: string): status is InvoiceStatus {
    return ['pending', 'paid', 'cancelled'].includes(status);
}
