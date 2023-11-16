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
  if (!session && (children?.props?.childProp?.segment != '__PAGE__')) {
    redirect("/api/auth/signin")
  } 
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
