"use server";
import { db } from "@/db";
import { Invoices, Customers } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { desc,eq,and, or, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";

// Define valid status types
type InvoiceStatus = "pending" | "paid" | "cancelled";

const stripe = new Stripe(String(process.env.STRIPE_API_SECRET));



export async function createInvoice(formData: FormData) {

    const { userId, orgId  } = await auth();//get the user id from the auth object
    console.log(userId);
    if(!userId) { throw new Error('User not found'); }

    
   
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

    // Handle customer name
    const rawName = formData.get('name');
    if (!rawName || typeof rawName !== 'string') {
        throw new Error('Name is required');
    }
    const name = rawName

    // Handle customer name
    const rawEmail = formData.get('email');
    if (!rawEmail || typeof rawEmail !== 'string') {
        throw new Error('Name is required');
    }
    const email = rawEmail;


    const status = 'pending' as const;

    console.log(name, email, amount, description);
    
    const insertCustomerData = {
        name: name,
        email: email,
        userId: userId,
        organizationId: orgId||null,
    }
    
    const [customer] = await db.insert(Customers).values(insertCustomerData).returning({id:Customers.id}); 
    const insertInvoiceData = {
        amount: amount,
        status: status,
        description: description,
        userId: userId,
        organizationId: orgId||null,
        customerId: customer.id
        
    } ;//as const;
    const results = await db.insert(Invoices).values(insertInvoiceData).returning({id:Invoices.id});  
    //results[0].id;
    redirect(`/invoices/${results[0].id}`);
}

export async function updateInvoice(formData: FormData) {
    const { userId, orgId } = await auth();
    if (!userId) { 
        throw new Error('User not found'); 
    }

    const id = Number(formData.get('id'));
    const statusValue = formData.get('status');
    const shouldRedirect = formData.get('redirect') === 'true';
    
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
    
    try {
        if(orgId) {
            await db.update(Invoices)
                .set(updateData)
                .where(and(
                    eq(Invoices.id, id),
                    eq(Invoices.organizationId, orgId),
                ));
        } else {
            await db.update(Invoices)
                .set(updateData)
                .where(and(
                    eq(Invoices.id, id),
                    eq(Invoices.userId, userId),
                    isNull(Invoices.organizationId),               
                ));
        }

        if (shouldRedirect) {
            redirect(`/invoices/${id}`);
        }
        return { success: true };
    } catch (error) {
        console.error('Error updating invoice:', error);
        return { success: false, error: 'Failed to update invoice' };
    }
}
export async function deleteInvoice(formData: FormData) {
    const { userId, orgId } = await auth();
    if (!userId) { 
        throw new Error('User not found'); 
    }

    const id = Number(formData.get('id'));
 
   // Debug logging
   if(orgId) 
   {
        await db.delete(Invoices)        
                .where(and(
                    eq(Invoices.id, id),
                    //eq(Invoices.userId, userId),
                    eq(Invoices.organizationId, orgId)
                ))
   }
   else{
        await db.delete(Invoices)        
                .where(and(
                    eq(Invoices.id, id),
                    eq(Invoices.userId, userId),
                    isNull(Invoices.organizationId)
                ))
    }
    redirect(`/dashboard/`);
}
export async function getInvoices() {
    const { userId,orgId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }
    let invoices;
    if(orgId)
        invoices = await db.select().from(Invoices)
                                        .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
                                        .where(eq(Invoices.organizationId,orgId)).orderBy(desc(Invoices.createTs));
    else    
        invoices = await db.select().from(Invoices)
                                        .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
                                        .where(and(
                                            eq(Invoices.userId,userId),
                                            isNull(Invoices.organizationId)
                                        )).orderBy(desc(Invoices.createTs));

    return invoices;
}
export async function getInvoice(id: number) {
    const { userId, orgId } = await auth();//get the user id from the auth object
    if(!userId) { throw new Error('User not found'); }


    let result;
    if(orgId)
        result = await db.select().from(Invoices)
                                     .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
                                    .where(and(eq(Invoices.id,id),eq(Invoices.organizationId,orgId))).limit(1).then(results => results[0]);  
    else
        result = await db.select().from(Invoices)        
                                     .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
                                    .where(and(eq(Invoices.id,id),
                                            eq(Invoices.userId,userId),
                                        isNull(Invoices.organizationId))).limit(1).then(results => results[0]);  



    // const result = await db.select().from(Invoices)
    //                                  .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
    //                                 .where(and(eq(Invoices.id,id),eq(Invoices.userId,userId))).limit(1).then(results => results[0]); ;
    //console.log(result[0].invoices);
    const invoice = {...result.invoices,customer:result.customers};//merge the invoice and customer objects into one object
    return invoice;

    //return result;
}
export async function getInvoice4Payment(invocieId: number) {
    
    let result = await db.select({
                                invoices: {
                                    id: Invoices.id,
                                    amount: Invoices.amount,
                                    status: Invoices.status,
                                    description: Invoices.description,
                                    createTs: Invoices.createTs,            
                                },
                                customers: {
                                    name: Customers.name,            
                                }
                            }).from(Invoices)
                              .innerJoin(Customers,eq(Invoices.customerId,Customers.id))
                              .where(eq(Invoices.id,invocieId)).limit(1).then(results => results[0]);  
    if (!result) {
        notFound();
    }
    const invoice = {...result.invoices,customer:result.customers};//merge the invoice and customer objects into one object
    return invoice;

    //return result;
}

export async function payInvoice(formData: FormData) {
    const headersList = await headers();//get the headers object
    const origin = headersList.get('origin');//get the origin from the headers object

    const { userId, orgId } = await auth();//get the user id from the auth object
    const invoiceId = Number(formData.get('invoiceId'));//get the invoice id from the form data
    if(!userId) { throw new Error('User not found'); }
    if(isNaN(invoiceId)) { throw new Error('Invalid invoice ID'); }
    const invoice = await getInvoice4Payment(invoiceId);
    console.log(invoice);
    if(!invoice) {
        notFound();
    }
    if(invoice.status !== 'pending') { throw new Error('Invoice is not pending');}

    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price_data: {
                currency: 'aud',
                product:'prod_RWvTjsC5xMc9hL',//product id
                unit_amount: invoice.amount,//convert to cents

            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/invoices/${invoiceId}/payment?paymentStatus=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/invoices/${invoiceId}/payment?paymentStatus=canceled&session_id={CHECKOUT_SESSION_ID}`,
      });

    if(!session.url) { throw new Error('Failed to create checkout session'); }  

    return redirect(session.url);

    //if(invoice.userId !== userId) { throw new Error('You are not authorized to pay this invoice');}
    //if(invoice.organizationId !== orgId) { throw new Error('You are not authorized to pay this invoice');}
    //await db.update(Invoices).set({ status: 'paid' }).where(eq(Invoices.id, invoiceId));
    //return redirect(`/invoices/${invoiceId}`);
}
// Type guard function
function isValidStatus(status: string): status is InvoiceStatus {
    return ['pending', 'paid', 'cancelled'].includes(status);
}
