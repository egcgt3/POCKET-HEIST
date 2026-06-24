import {
  generateCodename,
  adjectives,
  modifiers,
  animals,
} from "@/lib/generateCodename";

describe("generateCodename", () => {
  it("returns a PascalCase string of three capitalised words", () => {
    expect(generateCodename()).toMatch(/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/);
  });

  it("always draws from the correct word sets across many calls", () => {
    for (let i = 0; i < 100; i++) {
      const codename = generateCodename();

      const adj = adjectives.find((w) => codename.startsWith(w));
      expect(adj).toBeDefined();

      const rest = codename.slice(adj!.length);
      const mod = modifiers.find((w) => rest.startsWith(w));
      expect(mod).toBeDefined();

      const animal = rest.slice(mod!.length);
      expect(animals).toContain(animal);
    }
  });
});
