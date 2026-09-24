import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { assertValidResources, validateResources } from "../js/resource-schema.js";

const catalog = JSON.parse(
  await readFile(new URL("../data/resources.json", import.meta.url), "utf8"),
);

test("production catalog satisfies the resource contract", () => {
  assert.doesNotThrow(() => assertValidResources(catalog));
});

test("rejects duplicate ids and curator orders", () => {
  const invalid = [
    {
      id: "same-id",
      title: "One",
      description: "Description",
      note: "Note",
      category: "Development",
      type: "Guide",
      tags: ["JavaScript"],
      url: "https://example.com/one",
      addedAt: "2026-09-01",
      order: 1,
    },
    {
      id: "same-id",
      title: "Two",
      description: "Description",
      note: "Note",
      category: "Development",
      type: "Guide",
      tags: ["CSS"],
      url: "https://example.com/two",
      addedAt: "2026-09-02",
      order: 1,
    },
  ];

  const errors = validateResources(invalid);
  assert.equal(errors.some((error) => error.includes("duplicates")), true);
});

test("rejects malformed dates, insecure URLs, and empty tags", () => {
  const errors = validateResources([
    {
      id: "broken",
      title: "Broken",
      description: "Description",
      note: "Note",
      category: "Development",
      type: "Guide",
      tags: [],
      url: "http://example.com",
      addedAt: "2026-02-31",
      order: 1,
    },
  ]);

  assert.equal(errors.some((error) => error.includes("non-empty array")), true);
  assert.equal(errors.some((error) => error.includes("HTTPS")), true);
  assert.equal(errors.some((error) => error.includes("YYYY-MM-DD")), true);
});
