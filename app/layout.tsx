import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { ThemeProvider } from "@/providers/Theme-Provider";
import { UserProvider } from "@/context/userContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="fr" suppressHydrationWarning={true}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider session={session}>
            <UserProvider>
              <SidebarProvider>
                {session ? (
                  <>
                    <AppSidebar />
                    <main className="grow">
                      <SidebarTrigger />
                      <div className="flex flex-col min-h-screen overflow-hidden">
                        {children}
                      </div>
                    </main>
                  </>
                ) : (
                  <div className="flex flex-col w-full min-h-screen overflow-hidden">
                    {children}
                  </div>
                )}
              </SidebarProvider>
            </UserProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
