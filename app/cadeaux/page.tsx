"use client";
import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Cadeaux() {
  const { data: user } = useSession();
  const router = useRouter();
  const [drawnPerson, setDrawnPerson] = useState(null);
  const [alert, setAlert] = useState(null);
  const [gen, setGen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);

  // fix l'erreur que je trigger, check les comptes

  const fetchInitialData = useCallback(async () => {
    try {
      const drawingResponse = await fetch(`/api/user/${user.user.id}`);
      const drawingData = await drawingResponse.json();

      setGen(drawingData.gen);

      if (drawingData.nameOfPoll) {
        setDrawnPerson(drawingData.nameOfPoll);
        setHasDrawn(true);
      }
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user.user.id]);

  useEffect(() => {
    if (user.user.name === "Papy") {
      router.push("/");
      return;
    }
    fetchInitialData();
  }, [user.user.id, router, fetchInitialData, user.user.name]);

  const drawGift = async () => {
    try {
      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gen: gen,
          giverId: user.user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();
      setDrawnPerson(result.userGift.name);
      setHasDrawn(true);
      setAlert({
        type: "success",
        message: "Le tirage a été effectué avec succès !",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Erreur lors du tirage",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-4">Chargement...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold">
        Tirage au sort des cadeaux
      </CardHeader>
      <CardContent>
        {alert && (
          <Alert
            className={`mb-4 ${alert.type === "error" ? "bg-red-800" : ""}`}
          >
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        {hasDrawn ? (
          <div className="text-center">
            <p className="mb-2">Vous avez tiré au sort :</p>
            <p className="text-xl font-bold">{drawnPerson}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="mb-4">
              {user.user.gen === 1 ? "3" : "7"} participants sont inscrits pour
              le tirage au sort.
            </p>
            <p className="mb-4">
              Cliquez sur le bouton ci-dessous pour découvrir à qui vous devez
              offrir un cadeau.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={drawGift} className="w-full" disabled={hasDrawn}>
          {hasDrawn ? "Tirage déjà effectué" : "Effectuer le tirage"}
        </Button>
      </CardFooter>
    </Card>
  );
}
