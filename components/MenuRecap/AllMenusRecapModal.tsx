/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { menuOptions } from "@/types/menuOptions";

type MenuRecap = {
  name: string;
  username: string;
  entries: string | null;
  flat: string | null;
  desserts: string | null;
};

const useAllMenus = (isOpen: boolean) => {
  const [recap, setRecap] = useState<MenuRecap[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/menus/all");
        const data = await response.json();
        setRecap(data);
      } catch (error) {
        console.error("Erreur lors du chargement des menus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  return { recap, isLoading };
};

const getMenuItemName = (
  type: "entries" | "flat" | "desserts",
  id: string | null
): string => {
  if (!id) return "Non sélectionné";

  const optionsMap = {
    entries: menuOptions.starters,
    flat: menuOptions.mains,
    desserts: menuOptions.desserts,
  };

  const item = optionsMap[type]?.find((item) => item.id === id);
  return item?.name || "Non sélectionné";
};

export const AllMenusRecapModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { recap, isLoading } = useAllMenus(isOpen);

  const renderUserMenu = (menu: MenuRecap) => {
    return (
      <Card key={menu.username} className="p-4 bg-gray-800 border-none">
        <h3 className="font-semibold text-yellow-500 mb-2 capitalize">
          Invité: {menu.name}
        </h3>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>Entrée: {getMenuItemName("entries", menu.entries)}</li>
          <li>Plat: {getMenuItemName("flat", menu.flat)}</li>
          <li>Dessert: {getMenuItemName("desserts", menu.desserts)}</li>
        </ul>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Voir tous les menus
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-[70vw] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif de tous les menus
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Vue d'ensemble des choix de menu de tous les invités
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
            <p className="font-medium">Chargement des menus...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recap.map((menu) => renderUserMenu(menu))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};