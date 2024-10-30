/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

export const DateRecapModal = () => {
  const [recap, setRecap] = useState<{ [key: string]: User[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRecap = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/pollRecap", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();

      const organizedData: { [key: string]: User[] } = {
        vendredi: [],
        samedi: [],
        "les-deux": [],
        nonVoted: [],
      };

      data.forEach((user: User) => {
        if (user.pollDate) {
          organizedData[user.pollDate].push(user);
        } else {
          organizedData.nonVoted.push(user);
        }
      });

      setRecap(organizedData);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserList = (users: User[]) => {
    return users.map((user) => (
      <li key={user.id} className="py-1">
        {user.name}
      </li>
    ));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full" onClick={fetchRecap}>
          {isLoading ? "Chargement..." : "Voir le récapitulatif des votes"}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-full max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des votes
          </DialogTitle>
        </DialogHeader>
        {recap && (
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gray-800">
                <h3 className="font-semibold mb-2">Vendredi</h3>
                <ul className="list-disc list-inside">
                  {renderUserList(recap.vendredi)}
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  Total: {recap.vendredi.length} personnes
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-800">
                <h3 className="font-semibold mb-2">Samedi</h3>
                <ul className="list-disc list-inside">
                  {renderUserList(recap.samedi)}
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  Total: {recap.samedi.length} personnes
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-800">
                <h3 className="font-semibold mb-2">Les deux jours</h3>
                <ul className="list-disc list-inside">
                  {renderUserList(recap["les-deux"])}
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  Total: {recap["les-deux"].length} personnes
                </p>
              </div>
            </div>

            {recap.nonVoted.length > 0 && (
              <div className="p-4 rounded-lg bg-gray-800">
                <h3 className="font-semibold mb-2 text-yellow-500">
                  N'ont pas encore voté
                </h3>
                <ul className="list-disc list-inside">
                  {renderUserList(recap.nonVoted)}
                </ul>
                <p className="mt-2 text-sm text-gray-400">
                  Total: {recap.nonVoted.length} personnes
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
