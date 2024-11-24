import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userMenu = await prisma.userMenu.findFirst({
      where: {
        userId: userId,
      },
      include: {
        menu: true,
      },
    });

    if (!userMenu) {
      return NextResponse.json({
        menu: {
          entries: null,
          flat: null,
          desserts: null,
        },
      });
    }

    return NextResponse.json(userMenu);
  } catch (error) {
    console.error("GET Menu error:", error);
    return NextResponse.json({ error: "Error fetching menu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, entries, flat, desserts } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existingUserMenu = await prisma.userMenu.findFirst({
      where: {
        userId: userId,
      },
      include: {
        menu: true,
      },
    });

    if (existingUserMenu) {
      const updatedMenu = await prisma.menu.update({
        where: {
          id: existingUserMenu.menuId,
        },
        data: {
          entries,
          flat,
          desserts,
        },
      });

      return NextResponse.json({ menu: updatedMenu });
    } else {
      const newMenu = await prisma.$transaction(async (prisma) => {
        const menu = await prisma.menu.create({
          data: {
            entries,
            flat,
            desserts,
          },
        });

        const userMenu = await prisma.userMenu.create({
          data: {
            userId: userId,
            menuId: menu.id,
          },
          include: {
            menu: true,
          },
        });

        return userMenu;
      });

      return NextResponse.json(newMenu);
    }
  } catch (error) {
    console.error("POST Menu error:", error);
    return NextResponse.json(
      { error: "Error creating/updating menu" },
      { status: 500 }
    );
  }
}
