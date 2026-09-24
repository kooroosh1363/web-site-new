import test from "node:test";
import assert from "node:assert/strict";
import { buildUrlSearch, parseUrlState } from "../js/url-state.js";

test("parses supported URL state", () => {
  assert.deepEqual(
    parseUrlState("?q=css&category=Design&sort=newest&saved=true"),
    {
      query: "css",
      category: "Design",
      sort: "newest",
      savedOnly: true,
    },
  );
});

test("falls back from unknown sort values", () => {
  assert.equal(parseUrlState("?sort=random").sort, "featured");
});

test("serializes only non-default state", () => {
  assert.equal(
    buildUrlSearch({
      query: "  accessibility  ",
      category: "Design",
      sort: "name-asc",
      savedOnly: true,
    }),
    "?q=accessibility&category=Design&sort=name-asc&saved=true",
  );

  assert.equal(buildUrlSearch({}), "");
});

test("URL state round-trips", () => {
  const input = {
    query: "performance",
    category: "Development",
    sort: "newest",
    savedOnly: false,
  };

  assert.deepEqual(parseUrlState(buildUrlSearch(input)), input);
});
