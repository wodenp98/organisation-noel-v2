"use client";
import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DateRecapModal } from "@/components/Date/DateRecapModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type AlertType = {
  type: "error" | "success" | "info";
  message: string;
} | null;

// Type pour les données de l'utilisateur
type UserPollData = {
  id: string;
  name: string;
  pollDate: string | null;
};

const updatePollDate = async ({
  userId,
  pollDate,
}: {
  userId: string;
  pollDate: string | null;
}): Promise<UserPollData> => {
  const response = await fetch("/api/pollRecap", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, pollDate }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de la mise à jour");
  }

  return response.json();
};

export const DateComponent = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["pollData", userId],
    queryFn: async () => {
      const response = await fetch(`/api/pollRecap/${userId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            "Une erreur est survenue lors de la récupération de la date."
        );
      }
      return response.json();
    },
    enabled: Boolean(userId),
    select: (data) => {
      // Transform data if necessary
      return data;
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Mutation pour mettre à jour la date
  const mutation = useMutation({
    mutationFn: updatePollDate,
    onSuccess: (updatedUser) => {
      // Mise à jour du cache
      queryClient.setQueryData(["pollData", userId], updatedUser);

      // Mise à jour de l'état local
      setSelectedDate(updatedUser.pollDate);
      setIsDisabled(true);

      // Toast et alerte
      toast({
        title: "Vote enregistré",
        description: `Votre choix pour ${updatedUser.pollDate} a été enregistré.`,
      });
      setAlert({
        type: "success",
        message: `Vote enregistré pour: ${updatedUser.pollDate}`,
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      setAlert({
        type: "error",
        message: errorMessage,
      });

      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (data) {
      // Vous pouvez déjà faire cela dans onSuccess, mais voici une alternative
      setSelectedDate(data.pollDate);
      setIsDisabled(!!data.pollDate); // Désactive si une date existe déjà
    }
  }, [data]);

  // Fonction de soumission
  const onVoteSubmit = (selectedDate: string | null) => {
    if (selectedDate) {
      mutation.mutate({ userId, pollDate: selectedDate });
    } else {
      setAlert({
        type: "error",
        message: "Veuillez sélectionner une date",
      });
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onVoteSubmit(selectedDate);
  };

  const handleEdit = () => {
    setIsDisabled(false);
    setSelectedDate(null);
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
          disabled={isDisabled || mutation.isPending}
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
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Enregistrement..." : "Valider mon choix"}
            </Button>
          )}
          <DateRecapModal />
        </CardFooter>
      </form>
    </CardContent>
  );
};

export default DateComponent;
