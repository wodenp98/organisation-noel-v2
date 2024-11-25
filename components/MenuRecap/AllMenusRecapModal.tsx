/* eslint-disable react/no-unescaped-entities */
"use client";
import React from "react";
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
// import { useAllMenusRecap } from "@/hooks/useAllMenusRecap";

interface AllMenusRecap {
  name: string;
  username: string;
  entries: string | null;
  flat: string | null;
  desserts: string | null;
}

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

export function AllMenusRecapModal() {
  const [recap, setRecap] = React.useState<AllMenusRecap[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await fetch("/api/menus");
      if (!data.ok) {
        throw new Error(`Failed to fetch all menus: ${data.statusText}`);
      }
      const dataJson = await data.json();
      setRecap(dataJson);
    };
    fetchData();
  }, []);

  const renderUserMenu = (menu: AllMenusRecap) => (
    <Card key={menu.username} className="p-4 bg-gray-800 border-none">
      <h3 className="font-semibold text-yellow-500 mb-2 capitalize">
        {menu.name}
      </h3>
      <ul className="space-y-2 text-sm text-gray-300">
        <li>Entrée: {getMenuItemName("entries", menu.entries)}</li>
        <li>Plat: {getMenuItemName("flat", menu.flat)}</li>
        <li>Dessert: {getMenuItemName("desserts", menu.desserts)}</li>
      </ul>
    </Card>
  );

  return (
    <Dialog>
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
          <DialogDescription>
            Vue d'ensemble des choix de menu de tous les invités
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          {recap && recap.map((menu) => renderUserMenu(menu))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
