'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const InvoiceSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string()
});

const CreateInvoice = InvoiceSchema.omit({id: true, date: true}) //these will be put automatically
const UpdateInvoice = InvoiceSchema.omit({id: true, date: true}) 

export async function createInvoice(formData: FormData) {
    console.log("amount: ", formData.get('amount'));
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });
    // It's usually good practice to store monetary values in cents in your database to 
    // eliminate JavaScript floating-point errors and ensure greater accuracy.
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice'
        };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, formData: FormData){
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status')
    });

    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error){
        return {
            message: 'Database Error: Failed to Update Invoice'
        };
    }

    revalidatePath('/dashboard/invoices')
    // Note how redirect is being called outside of the try/catch block. This is because redirect works by throwing an error, 
    // which would be caught by the catch block. To avoid this, you can call redirect after try/catch. 
    // redirect would only be reachable if try is successful.
    redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string){
    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return {
            message: 'Database Error: Failed to Delete Invoice'
        };
    }

    // redirect('/dashboard/invoices')
}