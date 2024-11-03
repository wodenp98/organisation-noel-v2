import { UserAuthForm } from "@/components/user-auth-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Page() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <>
        <div className="container relative h-screen flex-col items-center justify-center ">
          <div className="pt-8">
            <div className="mx-auto flex flex-col justify-center space-y-6 w-[350px]">
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-4xl mb-20 font-semibold tracking-tight">
                  Organisation de Noël
                </h1>
                <h2 className="text-xl font-semibold tracking-tight">
                  Se connecter
                </h2>
                <p className="text-sm text-muted-foreground">
                  Entrez votre nom et mot de passe ci-dessous pour vous
                  connecter à votre compte
                </p>
              </div>
              <UserAuthForm />
            </div>
          </div>
        </div>
      </>
    </div>
  );
}
