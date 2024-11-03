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

    if (giver.gen === 0) {
      return NextResponse.json(
        { message: "Generation 0 is not part of the Secret Santa" },
        { status: 403 }
      );
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
    where: {
      AND: [{ gen: { in: [1, 2] } }],
    },
    select: {
      id: true,
      name: true,
      gen: true,
      hasFor: true,
    },
  });

  if (participants.length < 2) {
    throw new Error("Not enough participants");
  }

  const maxAttempts = 1000;
  let currentAttempt = 0;

  while (currentAttempt < maxAttempts) {
    try {
      const assignments = generateValidAssignments(participants);

      await prisma.$transaction(
        assignments.map((assignment) => {
          return prisma.draw.create({
            data: {
              giverId: assignment.giver.id,
              receiverId: assignment.receiver.id,
              gen: gen,
              isRevealed: false,
            },
          });
        })
      );

      return;
    } catch (error) {
      currentAttempt++;
      if (currentAttempt === maxAttempts) {
        throw new Error(
          "Unable to generate valid assignments after maximum attempts" + error
        );
      }
    }
  }
}

interface Participant {
  id: string;
  name: string;
  gen: number;
  hasFor: string | null;
}

interface Assignment {
  giver: Participant;
  receiver: Participant;
}

function isInHasForList(giver: Participant, receiver: Participant): boolean {
  if (!giver.hasFor) return false;

  const hasForList = giver.hasFor
    .split(",")
    .map((name) => name.toLowerCase().trim());

  return hasForList.includes(receiver.name);
}

function generateValidAssignments(participants: Participant[]): Assignment[] {
  const tryGenerateAssignments = (): Assignment[] | null => {
    const assignments: Assignment[] = [];
    const availableReceivers = [...participants];
    const tempParticipants = [...participants];

    for (const giver of tempParticipants) {
      const validReceivers = availableReceivers.filter(
        (receiver) =>
          receiver.id !== giver.id &&
          !isInHasForList(giver, receiver) &&
          !assignments.some((a) => a.receiver.id === receiver.id)
      );

      if (validReceivers.length === 0) {
        return null;
      }

      const selectedReceiver =
        validReceivers[Math.floor(Math.random() * validReceivers.length)];

      assignments.push({
        giver,
        receiver: selectedReceiver,
      });

      const receiverIndex = availableReceivers.findIndex(
        (r) => r.id === selectedReceiver.id
      );
      availableReceivers.splice(receiverIndex, 1);
    }

    return assignments;
  };

  for (let attempt = 0; attempt < 100; attempt++) {
    const result = tryGenerateAssignments();
    if (result) return result;
  }

  throw new Error(
    "Could not generate a valid distribution after multiple attempts"
  );
}
