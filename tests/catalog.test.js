import test from "node:test";
import assert from "node:assert/strict";
import { filterAndSort, getCategories, matchesQuery } from "../js/catalog.js";

const resources = [
  {
    id: "alpha",
    title: "Alpha Guide",
    description: "Learn accessible CSS",
    category: "Design",
    type: "Guide",
    tags: ["CSS", "A11Y"],
    addedAt: "2026-01-02",
    order: 2,
  },
  {
    id: "beta",
    title: "Beta Tools",
    description: "Debug JavaScript quickly",
    category: "Development",
    type: "Utility",
    tags: ["JavaScript"],
    addedAt: "2026-02-03",
    order: 1,
  },
];

test("matches query across title, description, category, type, and tags", () => {
  assert.equal(matchesQuery(resources[0], "accessible css"), true);
  assert.equal(matchesQuery(resources[1], "development utility"), true);
  assert.equal(matchesQuery(resources[0], "javascript"), false);
});

test("query matching is case-insensitive and ignores extra whitespace", () => {
  assert.equal(matchesQuery(resources[0], "  ALPHA   css "), true);
});

test("filters by category and bookmarks together", () => {
  const result = filterAndSort(resources, {
    category: "Development",
    savedOnly: true,
    bookmarks: new Set(["beta"]),
  });
  assert.deepEqual(result.map(({ id }) => id), ["beta"]);
});

test("sorts by curator order, title, and date", () => {
  assert.deepEqual(filterAndSort(resources).map(({ id }) => id), ["beta", "alpha"]);
  assert.deepEqual(filterAndSort(resources, { sort: "name-asc" }).map(({ id }) => id), ["alpha", "beta"]);
  assert.deepEqual(filterAndSort(resources, { sort: "newest" }).map(({ id }) => id), ["beta", "alpha"]);
});

test("returns a new array without mutating the catalog", () => {
  const original = resources.map(({ id }) => id);
  filterAndSort(resources, { sort: "name-desc" });
  assert.deepEqual(resources.map(({ id }) => id), original);
});

test("returns unique categories in catalog order", () => {
  assert.deepEqual(getCategories(resources), ["All", "Design", "Development"]);
});
