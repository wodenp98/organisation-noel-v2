// app/api/submitMenu/route.ts

import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      id,
      entree1,
      entree2,
      plat1,
      plat2,
      dessert1,
      dessert2,
      alcohol1,
      alcohol2,
    } = await request.json();

    // Set values to null if they are empty or undefined, which will clear them in the database
    const updatedData = {
      entries:
        entree1 || entree2
          ? [entree1, entree2].filter(Boolean).join(", ")
          : null,
      flat: plat1 || plat2 ? [plat1, plat2].filter(Boolean).join(", ") : null,
      desserts:
        dessert1 || dessert2
          ? [dessert1, dessert2].filter(Boolean).join(", ")
          : null,
      alcoholSoft:
        alcohol1 || alcohol2
          ? [alcohol1, alcohol2].filter(Boolean).join(", ")
          : null,
    };

    const user = await prisma.user.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
