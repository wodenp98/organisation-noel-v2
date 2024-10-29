"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { FamilyMenuRecapModal } from "@/components/Family/FamilyRecapModel";

const MenuForm = () => {
  const { data: user } = useSession();
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState({
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

  // Fonction pour nettoyer les valeurs vides
  const cleanFormData = (data) => {
    const cleaned = {};
    Object.entries(data).forEach(([key, value]) => {
      // Si la valeur est une chaîne vide ou composée uniquement d'espaces, on met null
      cleaned[key] = typeof value === "string" ? value.trim() || null : value;
    });
    return cleaned;
  };

  useEffect(() => {
    const fetchExistingChoices = async () => {
      try {
        const response = await fetch(`/api/getMenu?userId=${user.user.id}`);
        const data = await response.json();

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
        setAlert({
          type: "error",
          message: error.message || "Une erreur est survenue",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user.user.id) {
      fetchExistingChoices();
    }
  }, [user.user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des seconds choix si activés
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
      // Préparation des données pour l'API
      const submitData = {
        id: user.user.id,
        entree1: formState.entree1.trim(),
        entree2: formState.hasSecondEntree ? formState.entree2.trim() : null,
        plat1: formState.plat1.trim(),
        plat2: formState.hasSecondPlat ? formState.plat2.trim() : null,
        dessert1: formState.dessert1.trim(),
        dessert2: formState.hasSecondDessert ? formState.dessert2.trim() : null,
        alcohol1: formState.alcohol1.trim(),
        alcohol2: formState.hasSecondAlcohol ? formState.alcohol2.trim() : null,
      };

      // Nettoyage des valeurs vides
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

        // Mise à jour du formulaire pour refléter les changements
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
      setAlert({
        type: "error",
        message: error.message || "Une erreur est survenue",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (field) => {
    setFormState((prev) => {
      const newState = {
        ...prev,
        [field]: !prev[field],
      };

      // Si on désactive un switch, on vide le champ correspondant
      const fieldMapping = {
        hasSecondEntree: "entree2",
        hasSecondPlat: "plat2",
        hasSecondDessert: "dessert2",
        hasSecondAlcohol: "alcohol2",
      };

      if (!newState[field] && fieldMapping[field]) {
        newState[fieldMapping[field]] = "";
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
    <Card className="w-[350px] md:w-full max-w-2xl mb-20 mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Choix du menu</h2>
      </CardHeader>
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
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleSubmit} className="w-full">
          Enregistrer mes choix
        </Button>
        <FamilyMenuRecapModal />
      </CardFooter>
    </Card>
  );
};

export default MenuForm;
