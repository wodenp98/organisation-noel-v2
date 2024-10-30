import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { giverId, gen } = await request.json();
  try {
    const giver = await prisma.user.findUnique({
      where: { id: giverId },
    });
    if (!giver) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingDraw = await prisma.draw.findFirst({
      where: {
        gen: gen,
      },
    });

    if (!existingDraw) {
      await createInitialDraw(gen);
    }

    const assignment = await prisma.draw.findFirst({
      where: {
        giverId: giverId,
        gen: gen,
      },
      include: {
        receiver: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { message: "No draw found for this user" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.draw.update({
        where: {
          id: assignment.id,
        },
        data: {
          isRevealed: true,
        },
      }),
      prisma.user.update({
        where: {
          id: giverId,
        },
        data: {
          nameOfPoll: assignment.receiver.name,
        },
      }),
    ]);

    return NextResponse.json({ userGift: assignment.receiver });
  } catch (error) {
    console.error("Error in secret santa draw:", error);
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

async function createInitialDraw(gen: number) {
  const participants = await prisma.user.findMany({
    where: { gen: gen },
  });

  if (participants.length < 2) {
    throw new Error("Not enough participants");
  }

  const n = participants.length;
  const indices = Array.from({ length: n }, (_, i) => i);

  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  await prisma.$transaction(
    indices.map((_, i) => {
      const giver = participants[indices[i]];
      const receiver = participants[indices[(i + 1) % n]];

      return prisma.draw.create({
        data: {
          giverId: giver.id,
          receiverId: receiver.id,
          gen: gen,
          isRevealed: false,
        },
      });
    })
  );
}
