import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { giverId, gen } = await request.json();
  try {
    // Vérifier l'existence du donneur
    const giver = await prisma.user.findUnique({
      where: { id: giverId },
    });
    if (!giver) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Vérifier si un tirage existe déjà pour cette génération
    const existingDraw = await prisma.draw.findFirst({
      where: {
        gen: gen,
      },
    });

    if (!existingDraw) {
      // Créer le tirage initial s'il n'existe pas
      await createInitialDraw(gen);
    }

    // Révéler le résultat pour cet utilisateur
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

    // Mettre à jour l'utilisateur et le tirage dans une transaction
    await prisma.$transaction([
      // Marquer comme révélé pour cet utilisateur
      prisma.draw.update({
        where: {
          id: assignment.id,
        },
        data: {
          isRevealed: true,
        },
      }),
      // Mettre à jour le nom tiré pour l'utilisateur
      prisma.user.update({
        where: {
          id: giverId,
        },
        data: {
          nameOfPoll: assignment.receiver.name, // Supposant que le receiver a un champ 'name'
        },
      }),
    ]);

    return NextResponse.json({ userGift: assignment.receiver });
  } catch (error) {
    console.error("Error in secret santa draw:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
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

  // Mélanger les indices
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  // Créer les assignments en base de données
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
