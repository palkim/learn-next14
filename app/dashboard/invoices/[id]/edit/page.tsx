import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { Invoice } from '@/app/lib/definitions';
import { notFound } from 'next/navigation';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) {
      redirect("/api/auth/signin")
  }
  const id = params.id;
  const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);

  if (!invoice) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          {
            label: 'Edit Invoice',
            href: `/dashboard/invoices/${id}/edit`,
            active: true,
          },
        ]}
      />
      {/**Type assertion on invoice meaning that we are sure that fetchInvoicesById(id) will return Invoice which is not null */}
      <Form invoice={invoice as Invoice} customers={customers} /> 
    </main>
  );
}