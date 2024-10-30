import { prisma } from "@/utils/prisma/prisma";
import { NextResponse, NextRequest } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { userId, pollDate } = await request.json();
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        pollDate: pollDate,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating poll date:", error);
    return NextResponse.json(
      { error: "Failed to update poll date" },
      { status: 500 }
    );
  }
}
