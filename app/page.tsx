import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { CadeauxComponent } from "@/components/Cadeaux/CadeauxComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl text-center font-bold">
        Tirage au sort
      </CardHeader>
      <CardDescription className="text-center mb-4">
        Chacun fait un cadeau selon ses moyens
      </CardDescription>
      <CadeauxComponent userId={session.user.id} />
    </Card>
  );
}
