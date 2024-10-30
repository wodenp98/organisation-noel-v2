import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DateComponent } from "@/components/Date/DateComponent";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader className="text-2xl font-bold">Choix de la date</CardHeader>
      <CardContent>
        <DateComponent userId={session?.user.id} />
      </CardContent>
    </Card>
  );
}
