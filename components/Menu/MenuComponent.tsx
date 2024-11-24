"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useMenu } from "@/hooks/useMenu";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AllMenusRecapModal } from "@/components/MenuRecap/AllMenusRecapModal";

const menuOptions = {
  starters: [
    { id: "1", name: "Symphonie de Foie gras" },
    { id: "2", name: "Ballotine de cabillaud aux agrumes" },
  ],
  mains: [
    { id: "1", name: "Tournedos de canard, effeuillé de pdt" },
    { id: "2", name: "Cocotte de St Jacques au vin blanc" },
  ],
  desserts: [
    { id: "1", name: "Rosace vanille & son coeur fruits rouges" },
    { id: "2", name: "St Honoré revisité" },
  ],
};

const FormSchema = z.object({
  entries: z.string({
    required_error: "Veuillez sélectionner une entrée.",
  }),
  flat: z.string({
    required_error: "Veuillez sélectionner un plat principal.",
  }),
  desserts: z.string({
    required_error: "Veuillez sélectionner un dessert.",
  }),
});

type MenuChoice = z.infer<typeof FormSchema>;

export const MenuComponent = ({ userId }: { userId: string }) => {
  const { toast } = useToast();
  const { menuData, isLoading, createOrUpdateMenu } = useMenu(userId);
  const [hasExistingMenu, setHasExistingMenu] = React.useState(false);

  const form = useForm<MenuChoice>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      entries: "",
      flat: "",
      desserts: "",
    },
  });

  // Effet pour charger les données du menu existant
  React.useEffect(() => {
    if (menuData?.menu) {
      const { entries, flat, desserts } = menuData.menu;
      // Vérifier si au moins un choix a été fait
      const hasChoices = entries || flat || desserts;
      setHasExistingMenu(hasChoices);

      form.reset({
        entries: entries || "",
        flat: flat || "",
        desserts: desserts || "",
      });
    }
  }, [menuData, form]);

  async function onSubmit(data: MenuChoice) {
    try {
      await createOrUpdateMenu.mutateAsync(data);
      setHasExistingMenu(true);
      toast({
        title: "Menu mis à jour",
        description: "Vos choix de menu ont été enregistrés avec succès !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Impossible de mettre à jour vos choix de menu. Veuillez réessayer." |
          (error.message as string),
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return (
      <>
        <CardContent className="py-4">
          <div className="animate-pulse flex justify-center">Chargement...</div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="entries"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entrée</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre entrée" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuOptions.starters.map((starter) => (
                        <SelectItem key={starter.id} value={starter.id}>
                          {starter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="flat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plat Principal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre plat principal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuOptions.mains.map((main) => (
                        <SelectItem key={main.id} value={main.id}>
                          {main.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desserts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dessert</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre dessert" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {menuOptions.desserts.map((dessert) => (
                        <SelectItem key={dessert.id} value={dessert.id}>
                          {dessert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={createOrUpdateMenu.isPending}
            >
              {createOrUpdateMenu.isPending
                ? "Enregistrement..."
                : hasExistingMenu
                ? "Modifier mes choix"
                : "Enregistrer mes choix"}
            </Button>
            <AllMenusRecapModal />
          </form>
        </Form>
      </CardContent>
    </>
  );
};
