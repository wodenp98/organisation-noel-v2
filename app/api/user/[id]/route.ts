import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userById = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(userById, {
      headers: {
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
}
