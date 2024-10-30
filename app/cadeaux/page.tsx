import { Card, CardHeader } from "@/components/ui/card";
import { CadeauxComponent } from "@/components/Cadeaux/CadeauxComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Cadeaux() {
  const session = await auth();

  if (!session || session.user.name !== "Papy") {
    return redirect("/login");
  }

  return (
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold">Tirage au sort</CardHeader>
      <CadeauxComponent userId={session.user.id} />
    </Card>
  );
}
