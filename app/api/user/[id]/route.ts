import { prisma } from "@/utils/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: number } }
) {
  if (request.method === "GET") {
    const origin = request.headers.get("origin");

    if (origin && origin !== `http://localhost:3000`) {
      return new Response("Mauvaise origine de la requête", {
        status: 403,
      });
    }
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
  } else {
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        Allow: "GET",
      },
    });
  }
}
