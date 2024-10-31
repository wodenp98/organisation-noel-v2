"use client";
import React, { useState } from "react";
import { useMenuRecap } from "@/hooks/useMenuRecap";
import {
  Dialog,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const FamilyMenuRecapModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { recap, isLoading } = useMenuRecap(isOpen);

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
          Voir le récapitulatif des menus par famille
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-[70vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des menus par famille
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
            <p className="font-medium">Chargement des menus...</p>
          </div>
        ) : (
          recap && (
            <div className="grid gap-6">
              {Object.entries(recap).map(([family, items]) =>
                renderFamilyRecap(family, items)
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
