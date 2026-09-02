const normalize = (value = "") =>
  value
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export function matchesQuery(resource, query) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;

  const searchable = [
    resource.title,
    resource.description,
    resource.category,
    resource.type,
    ...(resource.tags ?? []),
  ]
    .map(normalize)
    .join(" ");

  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => searchable.includes(term));
}

export function filterAndSort(resources, options = {}) {
  const {
    query = "",
    category = "All",
    savedOnly = false,
    bookmarks = new Set(),
    sort = "featured",
  } = options;

  const filtered = resources.filter((resource) => {
    const inCategory = category === "All" || resource.category === category;
    const isSaved = !savedOnly || bookmarks.has(resource.id);
    return inCategory && isSaved && matchesQuery(resource, query);
  });

  const comparators = {
    "name-asc": (a, b) => a.title.localeCompare(b.title),
    "name-desc": (a, b) => b.title.localeCompare(a.title),
    newest: (a, b) => new Date(b.addedAt) - new Date(a.addedAt),
    featured: (a, b) => (a.order ?? 0) - (b.order ?? 0),
  };

  return [...filtered].sort(comparators[sort] ?? comparators.featured);
}

export function getCategories(resources) {
  return ["All", ...new Set(resources.map((resource) => resource.category))];
}
