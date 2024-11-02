import { Card, CardHeader, CardContent } from "@/components/ui/card";
// import { CadeauxComponent } from "@/components/Cadeaux/CadeauxComponent";
import { WrenchIcon, ClockIcon } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Cadeaux() {
  const session = await auth();

  if (!session || session.user.name === "Papy") {
    redirect("/login");
  }

  return (
    // <Card className="w-[350px] md:w-full max-w-md mx-auto">
    //   <CardHeader className="text-2xl font-bold">Tirage au sort</CardHeader>
    //   <CadeauxComponent userId={session.user.id} />
    // </Card>
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold text-center">
        Maintenance en cours
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-6">
        <div className="relative">
          <WrenchIcon className="h-20 w-20 animate-bounce" />
          <ClockIcon className="h-8 w-8 text-gray-400 absolute -bottom-2 -right-2 animate-pulse" />
        </div>

        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">
            Le tirage au sort est temporairement indisponible
          </h2>

          <p>
            Nous effectuons actuellement une maintenance pour améliorer votre
            expérience. Merci de revenir un peu plus tard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
