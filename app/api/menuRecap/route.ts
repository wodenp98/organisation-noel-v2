import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

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
      orderBy: {
        family: "asc",
      },
    });

    const organizedData = users.reduce<RecapData>((acc, user) => {
      const family = user.family || "Autre";
      if (!acc[family]) {
        acc[family] = {
          entries: [],
          flat: [],
          desserts: [],
          alcoholSoft: [],
        };
      }

      if (user.entries) acc[family].entries.push(user.entries);
      if (user.flat) acc[family].flat.push(user.flat);
      if (user.desserts) acc[family].desserts.push(user.desserts);
      if (user.alcoholSoft) acc[family].alcoholSoft.push(user.alcoholSoft);

      return acc;
    }, {});

    return NextResponse.json(organizedData);
  } catch (error) {
    console.error("Error fetching menu data:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, updates }: { userId: string; updates: MenuUpdates } =
      await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Filter out undefined values
    const validUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as MenuUpdates);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validUpdates,
      select: {
        id: true,
        family: true,
        entries: true,
        flat: true,
        desserts: true,
        alcoholSoft: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { error: "Failed to update menu" },
      { status: 500 }
    );
  }
}
