import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DateComponent } from "@/components/Date/DateComponent";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader className="text-2xl font-bold">Choix de la date</CardHeader>
      <CardContent>
        <DateComponent userId={session.user.id} />
      </CardContent>
    </Card>
  );
}
