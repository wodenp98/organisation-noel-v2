import { prisma } from "@/utils/prisma/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { userId, pollDate } = await request.json();

    // Utiliser une transaction pour s'assurer que les données sont cohérentes
    const result = await prisma.$transaction(async (tx) => {
      // Faire la mise à jour
      const updatedUser = await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          pollDate: pollDate,
        },
      });

      const allUsers = await tx.user.findMany({
        select: {
          id: true,
          name: true,
          pollDate: true,
        },
      });

      return {
        updatedUser,
        allUsers,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating poll date:", error);
    return NextResponse.json(
      { error: "Failed to update poll date" },
      { status: 500 }
    );
  }
}
