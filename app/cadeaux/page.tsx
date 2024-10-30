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
import { motion, AnimatePresence } from "framer-motion";

export default function Cadeaux() {
  const { data: user } = useSession();
  const router = useRouter();
  const [drawnPerson, setDrawnPerson] = useState(null);
  const [alert, setAlert] = useState(null);
  const [gen, setGen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const drawingResponse = await fetch(`/api/user/${user.user.id}`);
      const drawingData = await drawingResponse.json();
      setGen(drawingData.gen);

      // Vérifie si le tirage a déjà été révélé
      const drawResponse = await fetch(`/api/draw/${user.user.id}`);
      const drawData = await drawResponse.json();

      if (drawData.isRevealed) {
        setDrawnPerson(drawData.receiverName);
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
      setIsRevealing(true);
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

      // Animation de révélation
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    } finally {
      setIsRevealing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-4">
          <div className="animate-pulse flex justify-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] md:w-full max-w-md mx-auto">
      <CardHeader className="text-2xl font-bold">Tirage au sort</CardHeader>
      <CardContent>
        {alert && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Alert
                className={`mb-4 ${alert.type === "error" ? "bg-red-800" : ""}`}
              >
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            </motion.div>
          </AnimatePresence>
        )}

        <AnimatePresence mode="wait">
          {hasDrawn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="mb-2">Vous avez tiré au sort :</p>
              <p className="text-xl font-bold">{drawnPerson}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="mb-4">
                {gen === 1 ? "3" : "7"} participants sont inscrits pour le
                tirage au sort.
              </p>
              <p className="mb-4">
                Cliquez sur le bouton ci-dessous pour découvrir à qui vous devez
                offrir un cadeau.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
      <CardFooter>
        <Button
          onClick={drawGift}
          className="w-full relative"
          disabled={hasDrawn || isRevealing}
        >
          {isRevealing ? (
            <span className="animate-pulse">Tirage en cours...</span>
          ) : hasDrawn ? (
            "Tirage déjà effectué"
          ) : (
            "Effectuer le tirage"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
