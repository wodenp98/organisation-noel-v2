export const menuOptions = {
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
} as const;

export type MenuOption = {
  id: string;
  name: string;
};

export interface MenuOptions {
  starters: MenuOption[];
  mains: MenuOption[];
  desserts: MenuOption[];
}
