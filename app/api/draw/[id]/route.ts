import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const draw = await prisma.draw.findFirst({
      where: {
        giverId: params.id,
        isRevealed: true,
      },
      include: {
        receiver: true,
      },
    });

    if (!draw) {
      return NextResponse.json(
        { isRevealed: false, receiverName: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      isRevealed: draw.isRevealed,
      receiverName: draw.receiver.name,
    });
  } catch (error) {
    console.error("Error fetching draw:", error);
    return NextResponse.json(
      { message: "Error fetching draw information" },
      { status: 500 }
    );
  }
}
