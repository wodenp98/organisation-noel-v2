import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

interface FamilyAggregation {
  entries: Set<string>;
  flat: Set<string>;
  desserts: Set<string>;
  alcoholSoft: Set<string>;
}

interface OrganizedData {
  [key: string]: FamilyAggregation;
}

interface FinalResult {
  [key: string]: {
    entries: string[];
    flat: string[];
    desserts: string[];
    alcoholSoft: string[];
  };
}

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const users = await prisma.user.findMany({
      select: {
        family: true,
        entries: true,
        flat: true,
        desserts: true,
        alcoholSoft: true,
      },
    });

    console.log(users);

    const organizedData = users.reduce<OrganizedData>((acc, user) => {
      const family = user.family || "Autre";

      if (!acc[family]) {
        acc[family] = {
          entries: new Set<string>(),
          flat: new Set<string>(),
          desserts: new Set<string>(),
          alcoholSoft: new Set<string>(),
        };
      }

      if (user.entries) acc[family].entries.add(user.entries);
      if (user.flat) acc[family].flat.add(user.flat);
      if (user.desserts) acc[family].desserts.add(user.desserts);
      if (user.alcoholSoft) acc[family].alcoholSoft.add(user.alcoholSoft);

      return acc;
    }, {});

    console.log(organizedData);

    const result = Object.entries(organizedData).reduce<FinalResult>(
      (acc, [family, items]) => {
        acc[family] = {
          entries: Array.from(items.entries),
          flat: Array.from(items.flat),
          desserts: Array.from(items.desserts),
          alcoholSoft: Array.from(items.alcoholSoft),
        };
        return acc;
      },
      {}
    );

    console.log(result);

    const response = NextResponse.json(result, { status: 200 });

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
