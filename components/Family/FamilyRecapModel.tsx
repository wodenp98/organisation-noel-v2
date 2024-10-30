/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const FamilyMenuRecapModal = () => {
  const [recap, setRecap] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecap = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/menuRecap", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      setRecap(data);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFamilyRecap = (family: string, items: any) => (
    <div key={family} className="p-4 rounded-lg bg-gray-800">
      <h3 className="font-semibold mb-2 text-yellow-500">Famille: {family}</h3>
      <ul className="pl-4 text-sm text-gray-300 space-y-2">
        <li>
          Entrées:{" "}
          {items.entries.length > 0 ? items.entries.join(", ") : "Aucun"}
        </li>
        <li>Plat: {items.flat.length > 0 ? items.flat.join(", ") : "Aucun"}</li>
        <li>
          Dessert:{" "}
          {items.desserts.length > 0 ? items.desserts.join(", ") : "Aucun"}
        </li>
        <li>
          Boissons:{" "}
          {items.alcoholSoft.length > 0
            ? items.alcoholSoft.join(", ")
            : "Aucun"}
        </li>
      </ul>
    </div>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full" onClick={fetchRecap}>
          {isLoading
            ? "Chargement..."
            : "Voir le récapitulatif des menus par famille"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-[50vw] max-h-[80vh] overflow-auto bg-gray-900 p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des menus par famille
          </DialogTitle>
        </DialogHeader>
        {recap && (
          <div className="grid gap-6">
            {Object.entries(recap).map(([family, items]) =>
              renderFamilyRecap(family, items)
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
