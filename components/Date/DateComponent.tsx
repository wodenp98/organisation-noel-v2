"use client";
import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRecapModal } from "@/components/Date/DateRecapModal.tsx";
import { useSession } from "next-auth/react";

export const DateComponent = () => {
  const { data: user } = useSession();
  const [selectedDate, setSelectedDate] = useState("");
  const [alert, setAlert] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPollDate = async () => {
      try {
        const response = await fetch(`/api/user/${user.user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la date de vote");
        }

        const data = await response.json();

        if (data.pollDate) {
          setSelectedDate(data.pollDate);
          setIsDisabled(true);
        }
      } catch (error) {
        console.error("Erreur de récupération des données :", error);
        setAlert({
          type: "error",
          message: "Erreur de chargement des informations de vote",
        });
      }
    };

    if (user?.user?.id) {
      fetchPollDate();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setAlert({
        type: "error",
        message: "Veuillez sélectionner une date",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/updatePollDate", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.user.id,
          pollDate: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }

      setAlert({
        type: "success",
        message: `Vote enregistré pour: ${selectedDate}`,
      });
      setIsDisabled(true);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message || "Une erreur s'est produite",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsDisabled(false);
    setSelectedDate("");
  };

  return (
    <CardContent className="pb-0">
      {alert && (
        <Alert className={`mb-4 ${alert.type === "error" ? "bg-red-700" : ""}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <RadioGroup
          value={selectedDate ?? ""}
          onValueChange={setSelectedDate}
          className="space-y-4"
          disabled={isDisabled}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vendredi" id="vendredi" />
            <Label
              htmlFor="vendredi"
              className={isDisabled ? "text-gray-500" : ""}
            >
              Vendredi
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="samedi" id="samedi" />
            <Label
              htmlFor="samedi"
              className={isDisabled ? "text-gray-500" : ""}
            >
              Samedi
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="les-deux" id="les-deux" />
            <Label
              htmlFor="les-deux"
              className={isDisabled ? "text-gray-500" : ""}
            >
              Les deux jours
            </Label>
          </div>
        </RadioGroup>
        <CardFooter className="px-0 pt-6 flex flex-col gap-2">
          {isDisabled ? (
            <Button type="button" onClick={handleEdit} className="w-full">
              Modifier mon choix
            </Button>
          ) : (
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enregistrement..." : "Valider mon choix"}
            </Button>
          )}
          <DateRecapModal />
        </CardFooter>
      </form>
    </CardContent>
  );
};

export default DateComponent;
