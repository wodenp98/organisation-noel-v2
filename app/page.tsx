import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DateComponent } from "@/components/Date/DateComponent.tsx";

export default async function Home() {
  return (
    <Card className="w-[350px] mx-auto">
      <CardHeader className="text-2xl font-bold">Choix de la date</CardHeader>
      <CardContent>
        <DateComponent />
      </CardContent>
    </Card>
  );
}
