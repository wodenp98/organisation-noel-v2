import { NextResponse, NextRequest } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { error: "User ID and updates are required" },
        { status: 400 }
      );
    }

    if (!updates.entries || !updates.flat || !updates.desserts) {
      return NextResponse.json(
        { error: "Entrée, plat et dessert sont tous requis" },
        { status: 400 }
      );
    }

    const userMenu = await prisma.userMenu.findUnique({
      where: {
        userId_menuId: {
          userId: userId,
          menuId: userId,
        },
      },
      include: {
        menu: true,
        user: true,
      },
    });

    let updatedMenu;
    if (userMenu) {
      updatedMenu = await prisma.menu.update({
        where: { id: userMenu.menu.id },
        data: {
          entries: updates.entries,
          flat: updates.flat,
          desserts: updates.desserts,
        },
        include: {
          userMenus: {
            include: {
              user: true,
            },
          },
        },
      });
    } else {
      updatedMenu = await prisma.menu.create({
        data: {
          id: userId,
          entries: updates.entries,
          flat: updates.flat,
          desserts: updates.desserts,
          userMenus: {
            create: {
              userId: userId,
            },
          },
        },
        include: {
          userMenus: {
            include: {
              user: true,
            },
          },
        },
      });
    }
    const userName =
      userMenu?.user.name ||
      (updatedMenu.userMenus && updatedMenu.userMenus.length > 0
        ? updatedMenu.userMenus[0].user.name
        : "");

    const username =
      userMenu?.user.username ||
      (updatedMenu.userMenus && updatedMenu.userMenus.length > 0
        ? updatedMenu.userMenus[0].user.username
        : "");

    return NextResponse.json({
      name: userName,
      username: username,
      entries: updatedMenu.entries,
      flat: updatedMenu.flat,
      desserts: updatedMenu.desserts,
    });
  } catch (error) {
    console.error("POST Menu Update error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Error updating menu" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unexpected error occurred" },
      { status: 500 }
    );
  }
}
