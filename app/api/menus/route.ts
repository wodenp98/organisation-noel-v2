import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma/prisma";

export async function GET() {
  try {
    const allUserMenus = await prisma.userMenu.findMany({
      include: {
        menu: {
          select: {
            entries: true,
            flat: true,
            desserts: true,
          },
        },
        user: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedMenus = allUserMenus.map((userMenu) => ({
      name: userMenu.user.name,
      username: userMenu.user.username,
      entries: userMenu.menu.entries,
      flat: userMenu.menu.flat,
      desserts: userMenu.menu.desserts,
    }));

    return NextResponse.json(formattedMenus);
  } catch (error) {
    console.error("GET All Menus error:", error);
    return NextResponse.json(
      { error: "Error fetching all menus" },
      { status: 500 }
    );
  }
}
