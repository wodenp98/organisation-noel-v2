"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

type AlertType = {
  type: "error" | "success" | "info";
  message: string;
} | null;

export const CadeauxComponent = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [drawnPerson, setDrawnPerson] = useState(null);
  const [alert, setAlert] = useState<AlertType>(null);
  const [gen, setGen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const drawingResponse = await fetch(`/api/user/${userId}`, {
        next: {
          revalidate: 0,
        },
      });
      const drawingData = await drawingResponse.json();
      setGen(drawingData.gen);

      const drawResponse = await fetch(`/api/draw/${userId}`, {
        next: {
          revalidate: 0,
        },
      });
      const drawData = await drawResponse.json();

      if (drawData.isRevealed) {
        setDrawnPerson(drawData.receiverName);
        setHasDrawn(true);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      setAlert({
        type: "error",
        message: message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInitialData();
  }, [userId, router, fetchInitialData]);

  const drawGift = async () => {
    try {
      if (!userId) {
        setAlert({
          type: "error",
          message: "Veuillez vous connecter à votre compte pour tirer",
        });
        return;
      }
      setIsRevealing(true);
      const response = await fetch("/api/drawings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gen: gen,
          giverId: userId,
        }),
        next: {
          revalidate: 0,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDrawnPerson(result.userGift.name);
      setHasDrawn(true);
      setAlert({
        type: "success",
        message: "Le tirage a été effectué avec succès !",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      setAlert({
        type: "error",
        message: message,
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
    <>
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
    </>
  );
};
