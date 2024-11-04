"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export const CadeauxComponent = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [drawnPerson, setDrawnPerson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const drawingResponse = await fetch(`/api/user/${userId}`);
      const drawingData = await drawingResponse.json();
      setGen(drawingData.gen);

      const drawResponse = await fetch(`/api/draw/${userId}`);
      const drawData = await drawResponse.json();

      if (drawData.isRevealed) {
        setDrawnPerson(drawData.receiverName);
        setHasDrawn(true);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    fetchInitialData();
  }, [userId, router, fetchInitialData]);

  const drawGift = async () => {
    try {
      if (!userId) {
        toast({
          variant: "destructive",
          description: "Veuillez vous connecter à votre compte pour tirer",
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
          giverId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const result = await response.json();

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setDrawnPerson(result.userGift.name);
      setHasDrawn(true);
      toast({
        description: "Le tirage a été effectué avec succès !",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
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
