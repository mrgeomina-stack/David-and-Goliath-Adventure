import { describe, it, expect } from "vitest";
import { Journal } from "../src/journal";
describe("earned keepsakes", () => {
  it("preserves completed chapters after reopening without inventing rewards", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) || null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    };
    const first = new Journal(storage);
    expect(first.completed.size).toBe(0);
    expect(first.earn("maze")).toBe(true);
    expect(first.earn("maze")).toBe(false);
    expect([...new Journal(storage).completed]).toEqual(["maze"]);
  });
  it("tolerates unavailable storage and ignores damaged or unknown saved entries", () => {
    const blocked = {
      getItem: () => {
        throw Error("Blocked");
      },
      setItem: () => {
        throw Error("Quota");
      },
    };
    const book = new Journal(blocked);
    expect(() => book.earn("sheep")).not.toThrow();
    expect(book.completed.has("sheep")).toBe(true);
    expect(
      new Journal({ getItem: () => "{invalid", setItem: () => {} }).completed
        .size,
    ).toBe(0);
    expect([
      ...new Journal({
        getItem: () => JSON.stringify(["other", "brook", 4]),
        setItem: () => {},
      }).completed,
    ]).toEqual(["brook"]);
  });
});
