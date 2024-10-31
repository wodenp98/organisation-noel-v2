"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type User = {
  id: string;
  name: string;
  pollDate: string | null;
};

type OrganizedData = {
  vendredi: User[];
  samedi: User[];
  "les-deux": User[];
  nonVoted: User[];
};

const fetchRecap = async (): Promise<User[]> => {
  const response = await fetch(`/api/pollRecap`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch recap data");
  }
  return response.json();
};

const organizeUserData = (users: User[]): OrganizedData => {
  return users.reduce(
    (acc, user) => {
      const category = user.pollDate || "nonVoted";
      acc[category].push(user);
      return acc;
    },
    {
      vendredi: [] as User[],
      samedi: [] as User[],
      "les-deux": [] as User[],
      nonVoted: [] as User[],
    }
  );
};

export const DateRecapModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["pollRecap"],
    queryFn: fetchRecap,
    enabled: isOpen,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: isOpen ? 30000 : false, // Poll every 30 seconds when modal is open
  });

  const organizedData = users ? organizeUserData(users) : null;

  const renderUserList = (users: User[]) => (
    <ul className="list-disc list-inside">
      {users.map((user) => (
        <li key={user.id} className="py-1">
          {user.name}
        </li>
      ))}
    </ul>
  );

  const renderCategory = (
    title: string,
    users: User[],
    bgColor = "bg-gray-800"
  ) => (
    <div className={`p-4 rounded-lg ${bgColor}`}>
      <h3 className="font-semibold mb-2">{title}</h3>
      {renderUserList(users)}
      <p className="mt-2 text-sm text-gray-400">
        Total: {users.length} personnes
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full">
          Voir le récapitulatif des votes
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-full max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">
            Récapitulatif des votes
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
            <p className="font-medium">Chargement des votes...</p>
          </div>
        ) : (
          organizedData && (
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderCategory("Vendredi", organizedData.vendredi)}
                {renderCategory("Samedi", organizedData.samedi)}
                {renderCategory("Les deux jours", organizedData["les-deux"])}
              </div>

              {organizedData.nonVoted.length > 0 && (
                <div className="mt-4">
                  {renderCategory(
                    "N'ont pas encore voté",
                    organizedData.nonVoted,
                    "bg-gray-800"
                  )}
                </div>
              )}
            </div>
          )
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DateRecapModal;
