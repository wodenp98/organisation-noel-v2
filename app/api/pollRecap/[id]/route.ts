import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const users = await prisma.user.findFirst({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        pollDate: true,
      },
    });
    console.log(users);

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}
