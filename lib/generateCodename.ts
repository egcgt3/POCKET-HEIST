export const adjectives = [
  "Swift",
  "Silent",
  "Shadow",
  "Cunning",
  "Phantom",
  "Sly",
  "Bold",
  "Grim",
  "Wily",
  "Midnight",
  "Slick",
  "Rogue",
];

export const modifiers = [
  "Crimson",
  "Onyx",
  "Golden",
  "Silver",
  "Scarlet",
  "Iron",
  "Cobalt",
  "Ivory",
  "Amber",
  "Obsidian",
  "Copper",
  "Jade",
];

export const animals = [
  "Fox",
  "Wolf",
  "Raven",
  "Viper",
  "Lynx",
  "Crow",
  "Hawk",
  "Jackal",
  "Ferret",
  "Panther",
  "Cobra",
  "Mink",
];

function pick(words: string[]): string {
  return words[Math.floor(Math.random() * words.length)];
}

export function generateCodename(): string {
  return pick(adjectives) + pick(modifiers) + pick(animals);
}
