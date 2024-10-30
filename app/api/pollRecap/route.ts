import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Désactive le cache statique de Next.js
export const revalidate = 0; // Désactive la revalidation

export async function GET() {
  try {
    // Force la lecture la plus récente de la base de données
    await prisma.$queryRaw`SELECT 1`; // Reset la connexion

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        pollDate: true,
      },
    });

    const response = NextResponse.json(users, { status: 200 });

    // Ajout des en-têtes pour désactiver le cache
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("Surrogate-Control", "no-store");

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
