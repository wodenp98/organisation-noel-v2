"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FamilyMenuRecapModal } from "@/components/Family/FamilyRecapModel";

type AlertType = {
  type: "error" | "success" | "info";
  message: string;
} | null;

interface FormData {
  [key: string]: string | number | null | undefined;
}

type FormState = {
  entree1: string;
  entree2: string;
  hasSecondEntree: boolean;
  plat1: string;
  plat2: string;
  hasSecondPlat: boolean;
  dessert1: string;
  dessert2: string;
  hasSecondDessert: boolean;
  alcohol1: string;
  alcohol2: string;
  hasSecondAlcohol: boolean;
};

export const MenuComponent = ({ userId }: { userId: string }) => {
  const [alert, setAlert] = useState<AlertType>(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState<FormState>({
    entree1: "",
    entree2: "",
    hasSecondEntree: false,
    plat1: "",
    plat2: "",
    hasSecondPlat: false,
    dessert1: "",
    dessert2: "",
    hasSecondDessert: false,
    alcohol1: "",
    alcohol2: "",
    hasSecondAlcohol: false,
  });

  const cleanFormData = (data: FormData) => {
    const cleaned: FormData = {};
    Object.entries(data).forEach(([key, value]) => {
      cleaned[key] = typeof value === "string" ? value.trim() || null : value;
    });
    console.log(cleaned);
    return cleaned;
  };

  useEffect(() => {
    const fetchExistingChoices = async () => {
      try {
        const response = await fetch(`/api/getMenu/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log(data);

        if (data.success) {
          setFormState({
            entree1: data.menu.entree1 || "",
            entree2: data.menu.entree2 || "",
            hasSecondEntree: !!data.menu.entree2,
            plat1: data.menu.plat1 || "",
            plat2: data.menu.plat2 || "",
            hasSecondPlat: !!data.menu.plat2,
            dessert1: data.menu.dessert1 || "",
            dessert2: data.menu.dessert2 || "",
            hasSecondDessert: !!data.menu.dessert2,
            alcohol1: data.menu.alcohol1 || "",
            alcohol2: data.menu.alcohol2 || "",
            hasSecondAlcohol: !!data.menu.alcohol2,
          });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "An unknown error occurred";

        setAlert({
          type: "error",
          message: message,
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchExistingChoices();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      (formState.hasSecondEntree && !formState.entree2?.trim()) ||
      (formState.hasSecondPlat && !formState.plat2?.trim()) ||
      (formState.hasSecondDessert && !formState.dessert2?.trim()) ||
      (formState.hasSecondAlcohol && !formState.alcohol2?.trim())
    ) {
      setAlert({
        type: "error",
        message: "Veuillez remplir tous les seconds choix activés",
      });
      return;
    }

    try {
      if (!userId) {
        setAlert({
          type: "error",
          message: "Veuillez vous connecter à votre compte pour tirer",
        });
        return;
      }
      console.log(userId);
      const submitData = {
        id: userId,
        entree1: formState.entree1.trim(),
        entree2: formState.hasSecondEntree ? formState.entree2.trim() : null,
        plat1: formState.plat1.trim(),
        plat2: formState.hasSecondPlat ? formState.plat2.trim() : null,
        dessert1: formState.dessert1.trim(),
        dessert2: formState.hasSecondDessert ? formState.dessert2.trim() : null,
        alcohol1: formState.alcohol1.trim(),
        alcohol2: formState.hasSecondAlcohol ? formState.alcohol2.trim() : null,
      };

      const cleanedData = cleanFormData(submitData);

      const response = await fetch("/api/submitMenu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });

      const result = await response.json();

      if (result.success) {
        setAlert({
          type: "success",
          message: "Vos choix ont été enregistrés",
        });

        setFormState((prev) => ({
          ...prev,
          entree2: formState.hasSecondEntree ? prev.entree2 : "",
          plat2: formState.hasSecondPlat ? prev.plat2 : "",
          dessert2: formState.hasSecondDessert ? prev.dessert2 : "",
          alcohol2: formState.hasSecondAlcohol ? prev.alcohol2 : "",
        }));
      } else {
        setAlert({
          type: "error",
          message: result.message || "Une erreur est survenue",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";

      setAlert({
        type: "error",
        message: message,
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (field: keyof FormState) => {
    setFormState((prev) => {
      const newState: FormState = {
        ...prev,
        [field]: !prev[field],
      };

      const fieldMapping: { [key in keyof FormState]?: keyof FormState } = {
        hasSecondEntree: "entree2",
        hasSecondPlat: "plat2",
        hasSecondDessert: "dessert2",
        hasSecondAlcohol: "alcohol2",
      };

      if (!newState[field] && fieldMapping[field]) {
        newState[fieldMapping[field]] = "" as never;
      }

      return newState;
    });
  };

  if (loading) {
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
      {alert && (
        <Alert
          className={`mb-4 ${
            alert.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Entrées */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="entree1">Entrée</Label>
            <Input
              id="entree1"
              name="entree1"
              value={formState.entree1}
              onChange={handleInputChange}
              placeholder="Premier choix d'entrée"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondEntree}
              onCheckedChange={() => handleSwitchChange("hasSecondEntree")}
            />
            <Label>Ajouter une seconde entrée</Label>
          </div>

          {formState.hasSecondEntree && (
            <Input
              name="entree2"
              value={formState.entree2}
              onChange={handleInputChange}
              placeholder="Second choix d'entrée"
              className="mt-1"
            />
          )}
        </div>

        {/* Plats */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="plat1">Plat</Label>
            <Input
              id="plat1"
              name="plat1"
              value={formState.plat1}
              onChange={handleInputChange}
              placeholder="Premier choix de plat"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondPlat}
              onCheckedChange={() => handleSwitchChange("hasSecondPlat")}
            />
            <Label>Ajouter un second plat</Label>
          </div>

          {formState.hasSecondPlat && (
            <Input
              name="plat2"
              value={formState.plat2}
              onChange={handleInputChange}
              placeholder="Second choix de plat"
              className="mt-1"
            />
          )}
        </div>

        {/* Desserts */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="dessert1">Dessert</Label>
            <Input
              id="dessert1"
              name="dessert1"
              value={formState.dessert1}
              onChange={handleInputChange}
              placeholder="Premier choix de dessert"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondDessert}
              onCheckedChange={() => handleSwitchChange("hasSecondDessert")}
            />
            <Label>Ajouter un second dessert</Label>
          </div>

          {formState.hasSecondDessert && (
            <Input
              name="dessert2"
              value={formState.dessert2}
              onChange={handleInputChange}
              placeholder="Second choix de dessert"
              className="mt-1"
            />
          )}
        </div>

        {/* Boissons */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="alcohol1">Boisson</Label>
            <Input
              id="alcohol1"
              name="alcohol1"
              value={formState.alcohol1}
              onChange={handleInputChange}
              placeholder="Premier choix de boisson"
              className="mt-1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formState.hasSecondAlcohol}
              onCheckedChange={() => handleSwitchChange("hasSecondAlcohol")}
            />
            <Label>Ajouter une seconde boisson</Label>
          </div>

          {formState.hasSecondAlcohol && (
            <Input
              name="alcohol2"
              value={formState.alcohol2}
              onChange={handleInputChange}
              placeholder="Second choix de boisson"
              className="mt-1"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button type="submit" className="w-full">
            Enregistrer mes choix
          </Button>
          <FamilyMenuRecapModal />
        </div>
      </form>
    </CardContent>
  );
};
