"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInvoice } from "@/app/actions";
import Form from 'next/form';
import { SyntheticEvent, useState } from "react";
import SubmitButton from "@/components/SubmitButton";
import Container from "@/components/Container";

export default function CreateInvoicePage() { 
    const [state, setState] = useState("ready");

    const handleOnFormSubmit = async (event: SyntheticEvent) => {
        if(state === "pending"){ 
            event.preventDefault()
            return;
        }
        setState("pending");
    };

  return (
    <main className="h-full">
        <Container>
            <div className="flex justify-between mb-6">            
                <h1 className="text-3xl font-bold">Create a new Invoice</h1>    
            </div>       
            <Form action={createInvoice} onSubmit={handleOnFormSubmit} className="grid gap-4 max-w-sm">
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
                    <Input name="amount" id="amount" type="number" step="0.01" />
                </div>
                <div>
                    <Label htmlFor="description" className="block mb-2 font-semibold text-sm">Description</Label>
                    <Textarea name="description" id="description" />
                </div>
                <div>
                    <SubmitButton/>
                </div>            
            </Form>
        </Container>
    </main>
  );
}