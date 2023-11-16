import '@/app/ui/global.css'
import { inter } from '@/app/ui/fonts'
import { auth } from "@/auth";
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("children: ", children);
  const session = await auth();
  if (!session ) {
    redirect("/api/auth/signin")
  } 
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
