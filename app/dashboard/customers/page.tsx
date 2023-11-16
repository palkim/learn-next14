import { auth } from "@/auth";

export default async function Page() {
    const session = await auth();
    // if (!session) {
    //     redirect("/api/auth/signin")
    // } 
    return <p>Customers Page</p>;
}