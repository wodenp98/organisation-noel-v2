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
import { menuOptions } from "@/types/menuOptions";

interface FamilyAggregation {
  username: string;
  name: string;
  entries: string;
  flat: string;
  desserts: string;
}

export const MenuRecapModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { recap, isLoading } = useMenuRecap(isOpen);

  const countDishSelections = () => {
    if (!recap) return null;

    const selections = {
      starters: {},
      mains: {},
      desserts: {},
    };

    Object.values(recap).forEach((family) => {
      if (family.entries) {
        selections.starters[family.entries] =
          (selections.starters[family.entries] || 0) + 1;
      }

      if (family.flat) {
        selections.mains[family.flat] =
          (selections.mains[family.flat] || 0) + 1;
      }

      if (family.desserts) {
        selections.desserts[family.desserts] =
          (selections.desserts[family.desserts] || 0) + 1;
      }
    });

    return selections;
  };

  const renderFamilyRecap = (items: FamilyAggregation) => {
    const getDishName = (
      category: "starters" | "mains" | "desserts",
      id: string
    ) => {
      const dish = menuOptions[category].find((dish) => dish.id === id);
      return dish ? dish.name : "Non défini";
    };

    return (
      <div key={items.username} className="p-4 rounded-lg bg-gray-800">
        <h3 className="font-semibold mb-2 text-yellow-500 capitalize">
          {items.username}
        </h3>
        <ul className="text-sm text-gray-300 space-y-2">
          <li>Entrées: {getDishName("starters", items.entries)}</li>
          <li>Plat: {getDishName("mains", items.flat)}</li>
          <li>Dessert: {getDishName("desserts", items.desserts)}</li>
        </ul>
      </div>
    );
  };

  const renderDishCounts = () => {
    const selections = countDishSelections();
    if (!selections) return null;

    return (
      <div className="mt-6 space-y-4 rounded-lg bg-gray-800 p-4">
        <h2 className="text-lg font-bold text-yellow-500">
          Résumé des sélections
        </h2>

        <div>
          <h3 className="font-semibold mb-2 text-yellow-500">Entrées</h3>
          {Object.entries(selections.starters).map(([dishId, count]) => (
            <div key={dishId} className="flex justify-between text-sm">
              <span>{getDishName("starters", dishId)}</span>
              <span className="font-bold">{count} sélection(s)</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-yellow-500">Plats</h3>
          {Object.entries(selections.mains).map(([dishId, count]) => (
            <div key={dishId} className="flex justify-between text-sm">
              <span>{getDishName("mains", dishId)}</span>
              <span className="font-bold">{count} sélection(s)</span>
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-yellow-500">Desserts</h3>
          {Object.entries(selections.desserts).map(([dishId, count]) => (
            <div key={dishId} className="flex justify-between text-sm">
              <span>{getDishName("desserts", dishId)}</span>
              <span className="font-bold">{count} sélection(s)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getDishName = (
    category: "starters" | "mains" | "desserts",
    id: string
  ) => {
    const dish = menuOptions[category].find((dish) => dish.id === id);
    return dish ? dish.name : "Non défini";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full">
          Voir le récapitulatif des menus
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-[70vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des menus
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
              <div className="grid gap-6">
                {Object.entries(recap).map(([name, items]) =>
                  renderFamilyRecap({ ...items, name })
                )}
              </div>
              {renderDishCounts()}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};
