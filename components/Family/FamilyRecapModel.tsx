/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MenuItems {
  entries: string[];
  flat: string[];
  desserts: string[];
  alcoholSoft: string[];
}

interface RecapData {
  [key: string]: MenuItems;
}

export const FamilyMenuRecapModal = () => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecap = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/menuRecap?t=${timestamp}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Pragma: "no-cache",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
        cache: "no-store",
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRecap(data);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRecap();
    }
  }, [isOpen, fetchRecap]);

  const renderFamilyRecap = (family: string, items: MenuItems) => (
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full">
          {isLoading
            ? "Chargement..."
            : "Voir le récapitulatif des menus par famille"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-[50vw] max-h-[80vh] overflow-auto bg-gray-900 p-6 rounded-lg">
        <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des menus par famille
          </DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRecap}
            disabled={isLoading}
          >
            {isLoading ? "..." : "Rafraîchir"}
          </Button>
        </DialogHeader>

        {error && <div className="text-red-500 mb-4">{error}</div>}

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
