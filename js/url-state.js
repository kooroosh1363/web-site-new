export const SORT_OPTIONS = new Set(["featured", "name-asc", "name-desc", "newest"]);

export function parseUrlState(search = "") {
  const params = new URLSearchParams(search);
  const sort = params.get("sort");

  return {
    query: params.get("q") ?? "",
    category: params.get("category") ?? "All",
    sort: SORT_OPTIONS.has(sort) ? sort : "featured",
    savedOnly: params.get("saved") === "true",
  };
}

export function buildUrlSearch(state = {}) {
  const params = new URLSearchParams();
  const query = typeof state.query === "string" ? state.query.trim() : "";
  const category = typeof state.category === "string" && state.category ? state.category : "All";
  const sort = SORT_OPTIONS.has(state.sort) ? state.sort : "featured";

  if (query) params.set("q", query);
  if (category !== "All") params.set("category", category);
  if (sort !== "featured") params.set("sort", sort);
  if (state.savedOnly === true) params.set("saved", "true");

  const value = params.toString();
  return value ? `?${value}` : "";
}
