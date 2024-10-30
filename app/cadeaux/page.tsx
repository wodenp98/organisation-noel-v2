import { Card, CardHeader } from "@/components/ui/card";
import { CadeauxComponent } from "@/components/Cadeaux/CadeauxComponent";
import { auth } from "@/auth";
export default async function Cadeaux() {
  const session = await auth();
  return (
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold">Tirage au sort</CardHeader>
      <CadeauxComponent
        userId={session?.user.id}
        username={session.user?.name}
      />
    </Card>
  );
}
