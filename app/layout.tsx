import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar/app-sidebar";
import { ThemeProvider } from "@/providers/Theme-Provider";
import { QueryProvider } from "@/providers/QueryClientProvider";
import { UserProvider } from "@/context/userContext";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/toaster";

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
            <QueryProvider>
              <UserProvider>
                <SidebarProvider>
                  {session ? (
                    <>
                      <AppSidebar />
                      <main className="grow relative">
                        <SidebarTrigger />
                        <div className="flex flex-col min-h-screen overflow-hidden">
                          {children}
                        </div>
                      </main>
                      <Toaster />
                    </>
                  ) : (
                    <div className="flex flex-col w-full min-h-screen overflow-hidden">
                      {children}
                    </div>
                  )}
                </SidebarProvider>
              </UserProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
