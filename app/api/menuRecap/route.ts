import { prisma } from "@/utils/prisma/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        family: true,
        entries: true,
        flat: true,
        desserts: true,
        alcoholSoft: true,
      },
    });

    // Organize data by family with aggregated contributions
    const organizedData = users.reduce((acc, user) => {
      const family = user.family || "Autre";

      // Initialize family entry if it doesn't exist
      if (!acc[family]) {
        acc[family] = {
          entries: new Set(),
          flat: new Set(),
          desserts: new Set(),
          alcoholSoft: new Set(),
        };
      }

      // Add contributions to each category, avoiding duplicates
      if (user.entries) acc[family].entries.add(user.entries);
      if (user.flat) acc[family].flat.add(user.flat);
      if (user.desserts) acc[family].desserts.add(user.desserts);
      if (user.alcoholSoft) acc[family].alcoholSoft.add(user.alcoholSoft);

      return acc;
    }, {});

    // Convert sets to arrays for easier JSON serialization
    const result = Object.entries(organizedData).reduce(
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

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
