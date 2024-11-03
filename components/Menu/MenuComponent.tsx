"use client";
import React, { useState, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FamilyMenuRecapModal } from "@/components/Family/FamilyRecapModel";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MenuFormState {
  entries: string;
  entries2: string | null;
  hasSecondEntries: boolean;
  flat: string;
  flat2: string | null;
  hasSecondFlat: boolean;
  desserts: string;
  desserts2: string | null;
  hasSecondDesserts: boolean;
  alcoholSoft: string;
  alcoholSoft2: string | null;
  hasSecondAlcoholSoft: boolean;
}

interface MenuResponse {
  success: boolean;
  menu: {
    entree1: string;
    entree2: string;
    plat1: string;
    plat2: string;
    dessert1: string;
    dessert2: string;
    alcohol1: string;
    alcohol2: string;
  };
}

interface MenuUpdates {
  entries?: string;
  flat?: string;
  desserts?: string;
  alcoholSoft?: string;
}

export const MenuComponent = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuData, isLoading } = useQuery<MenuResponse>({
    queryKey: ["menu", userId],
    queryFn: async () => {
      const response = await fetch(`/api/getMenu/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch menu");
      return response.json();
    },
    staleTime: 30000,
  });

  const [formState, setFormState] = useState<MenuFormState>({
    entries: "",
    entries2: null,
    hasSecondEntries: false,
    flat: "",
    flat2: null,
    hasSecondFlat: false,
    desserts: "",
    desserts2: null,
    hasSecondDesserts: false,
    alcoholSoft: "",
    alcoholSoft2: null,
    hasSecondAlcoholSoft: false,
  });

  const updateMenuMutation = useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: MenuUpdates;
    }) => {
      const response = await fetch("/api/menuRecap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update menu");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuRecap"] });
      toast({
        description: "Vos choix ont été enregistrés",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
      });
    },
  });

  React.useEffect(() => {
    if (menuData?.menu) {
      const { menu } = menuData;
      setFormState({
        entries: menu.entree1 || "",
        entries2: menu.entree2 || null,
        hasSecondEntries: !!menu.entree2,
        flat: menu.plat1 || "",
        flat2: menu.plat2 || null,
        hasSecondFlat: !!menu.plat2,
        desserts: menu.dessert1 || "",
        desserts2: menu.dessert2 || null,
        hasSecondDesserts: !!menu.dessert2,
        alcoholSoft: menu.alcohol1 || "",
        alcoholSoft2: menu.alcohol2 || null,
        hasSecondAlcoholSoft: !!menu.alcohol2,
      });
    }
  }, [menuData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      toast({
        variant: "destructive",
        description: "Veuillez vous connecter à votre compte",
      });
      return;
    }

    if (
      (formState.hasSecondEntries && !formState.entries2?.trim()) ||
      (formState.hasSecondFlat && !formState.flat2?.trim()) ||
      (formState.hasSecondDesserts && !formState.desserts2?.trim()) ||
      (formState.hasSecondAlcoholSoft && !formState.alcoholSoft2?.trim())
    ) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les seconds choix activés",
      });
      return;
    }

    const updates: MenuUpdates = {
      entries:
        formState.entries +
        (formState.hasSecondEntries && formState.entries2
          ? `, ${formState.entries2}`
          : ""),
      flat:
        formState.flat +
        (formState.hasSecondFlat && formState.flat2
          ? `, ${formState.flat2}`
          : ""),
      desserts:
        formState.desserts +
        (formState.hasSecondDesserts && formState.desserts2
          ? `, ${formState.desserts2}`
          : ""),
      alcoholSoft:
        formState.alcoholSoft +
        (formState.hasSecondAlcoholSoft && formState.alcoholSoft2
          ? `, ${formState.alcoholSoft2}`
          : ""),
    };

    try {
      await updateMenuMutation.mutateAsync({ userId, updates });
    } catch (error) {
      console.error("Error submitting menu:", error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (field: keyof MenuFormState) => {
    setFormState((prev) => {
      const fieldMapping: { [key: string]: string } = {
        hasSecondEntries: "entries2",
        hasSecondFlat: "flat2",
        hasSecondDesserts: "desserts2",
        hasSecondAlcoholSoft: "alcoholSoft2",
      };

      const newState = {
        ...prev,
        [field]: !prev[field],
      };

      if (fieldMapping[field] in newState) {
        (newState as any)[fieldMapping[field]] = null;
      }

      return newState;
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          Chargement des données...
        </CardContent>
      </Card>
    );
  }

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entrées */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="entries">Entrée</Label>
            <Input
              id="entries"
              name="entries"
              value={formState.entries}
              onChange={handleInputChange}
              placeholder="Premier choix d'entrée"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondEntries}
              onCheckedChange={() => handleSwitchChange("hasSecondEntries")}
            />
            <Label>Ajouter une seconde entrée</Label>
          </div>

          {formState.hasSecondEntries && (
            <Input
              name="entries2"
              value={formState.entries2 || ""}
              onChange={handleInputChange}
              placeholder="Second choix d'entrée"
              className="mt-1"
            />
          )}
        </div>

        {/* Plats */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="flat">Plat</Label>
            <Input
              id="flat"
              name="flat"
              value={formState.flat}
              onChange={handleInputChange}
              placeholder="Premier choix de plat"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondFlat}
              onCheckedChange={() => handleSwitchChange("hasSecondFlat")}
            />
            <Label>Ajouter un second plat</Label>
          </div>

          {formState.hasSecondFlat && (
            <Input
              name="flat2"
              value={formState.flat2 || ""}
              onChange={handleInputChange}
              placeholder="Second choix de plat"
              className="mt-1"
            />
          )}
        </div>

        {/* Desserts */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="desserts">Dessert</Label>
            <Input
              id="desserts"
              name="desserts"
              value={formState.desserts}
              onChange={handleInputChange}
              placeholder="Premier choix de dessert"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondDesserts}
              onCheckedChange={() => handleSwitchChange("hasSecondDesserts")}
            />
            <Label>Ajouter un second dessert</Label>
          </div>

          {formState.hasSecondDesserts && (
            <Input
              name="desserts2"
              value={formState.desserts2 || ""}
              onChange={handleInputChange}
              placeholder="Second choix de dessert"
              className="mt-1"
            />
          )}
        </div>

        {/* Boissons */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="alcoholSoft">Boisson</Label>
            <Input
              id="alcoholSoft"
              name="alcoholSoft"
              value={formState.alcoholSoft}
              onChange={handleInputChange}
              placeholder="Premier choix de boisson"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondAlcoholSoft}
              onCheckedChange={() => handleSwitchChange("hasSecondAlcoholSoft")}
            />
            <Label>Ajouter une seconde boisson</Label>
          </div>

          {formState.hasSecondAlcoholSoft && (
            <Input
              name="alcoholSoft2"
              value={formState.alcoholSoft2 || ""}
              onChange={handleInputChange}
              placeholder="Second choix de boisson"
              className="mt-1"
            />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={updateMenuMutation.isPending}
          >
            {updateMenuMutation.isPending
              ? "Enregistrement..."
              : "Enregistrer mes choix"}
          </Button>
          <FamilyMenuRecapModal />
        </div>
      </form>
    </CardContent>
  );
};
