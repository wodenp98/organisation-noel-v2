import { Card, CardHeader } from "@/components/ui/card";
import { auth } from "@/auth";
import { MenuComponent } from "@/components/Menu/MenuComponent";
import { redirect } from "next/navigation";

export default async function Menu() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <Card className="w-[350px] md:w-full max-w-2xl mb-20 mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Choisissez votre menu</h2>
      </CardHeader>
      <MenuComponent userId={session.user.id} />
    </Card>
  );
}
