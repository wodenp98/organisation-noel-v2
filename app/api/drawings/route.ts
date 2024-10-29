import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (request.method === "POST") {
    const { giverId, gen } = await request.json();

    try {
      // Vérifier l'existence du donneur
      const giver = await prisma.user.findUnique({
        where: { id: giverId },
      });

      if (!giver) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Récupération des participants de la même génération, en excluant le donneur
      const participants = await prisma.user.findMany({
        where: {
          gen: gen, // Filtre strict sur la génération
          NOT: { id: giverId }, // Exclut le donneur de la liste
        },
      });

      console.log(participants);

      // Vérifier si des participants sont disponibles
      if (participants.length === 0) {
        return NextResponse.json(
          {
            message: "No participants available to draw from",
          },
          { status: 404 }
        );
      }

      // Mélange aléatoire des participants pour éviter le biais
      const shuffledParticipants = participants.sort(() => 0.5 - Math.random());

      // Assurer qu'on a des participants valides
      const receivers = new Set();

      for (const receiver of shuffledParticipants) {
        if (receiver.id !== giverId) {
          receivers.add(receiver.id);
        }
      }

      // Vérifier que chaque participant peut recevoir un cadeau
      if (receivers.size < participants.length) {
        return NextResponse.json(
          { message: "Error: Not everyone can receive a gift" },
          { status: 400 }
        );
      }

      // Sélection aléatoire d'un receveur dans le Set
      const chosenReceiverId = Array.from(receivers)[0];
      const chosenReceiver = await prisma.user.findUnique({
        where: { id: chosenReceiverId },
      });

      // Mise à jour du donneur avec le receveur choisi
      await prisma.user.update({
        where: { id: giverId },
        data: {
          nameOfPoll: chosenReceiver.name,
        },
      });

      return NextResponse.json({ userGift: chosenReceiver });
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json(
      { message: `Method ${request.method} Not Allowed` },
      { status: 405 }
    );
  }
}
