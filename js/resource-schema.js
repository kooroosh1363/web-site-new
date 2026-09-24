const REQUIRED_STRING_FIELDS = ["id", "title", "description", "note", "category", "type"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateResources(resources) {
  const errors = [];

  if (!Array.isArray(resources)) {
    return ["Catalog must be an array."];
  }

  const ids = new Map();
  const orders = new Map();

  resources.forEach((resource, index) => {
    const label = `resource[${index}]`;

    if (!isPlainObject(resource)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof resource[field] !== "string" || !resource[field].trim()) {
        errors.push(`${label}.${field} must be a non-empty string.`);
      }
    }

    if (typeof resource.id === "string" && resource.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resource.id)) {
      errors.push(`${label}.id must use lowercase kebab-case.`);
    }

    if (!Array.isArray(resource.tags) || resource.tags.length === 0) {
      errors.push(`${label}.tags must be a non-empty array.`);
    } else {
      const normalizedTags = new Set();
      resource.tags.forEach((tag, tagIndex) => {
        if (typeof tag !== "string" || !tag.trim()) {
          errors.push(`${label}.tags[${tagIndex}] must be a non-empty string.`);
          return;
        }

        const normalized = tag.trim().toLowerCase();
        if (normalizedTags.has(normalized)) {
          errors.push(`${label}.tags contains duplicate tag "${tag}".`);
        }
        normalizedTags.add(normalized);
      });
    }

    if (typeof resource.url !== "string" || !isValidUrl(resource.url)) {
      errors.push(`${label}.url must be a valid HTTPS URL.`);
    }

    if (typeof resource.addedAt !== "string" || !isIsoDate(resource.addedAt)) {
      errors.push(`${label}.addedAt must be a valid YYYY-MM-DD date.`);
    }

    if (!Number.isInteger(resource.order) || resource.order < 1) {
      errors.push(`${label}.order must be a positive integer.`);
    }

    if (typeof resource.id === "string" && resource.id) {
      if (ids.has(resource.id)) {
        errors.push(`${label}.id duplicates resource[${ids.get(resource.id)}].id ("${resource.id}").`);
      } else {
        ids.set(resource.id, index);
      }
    }

    if (Number.isInteger(resource.order)) {
      if (orders.has(resource.order)) {
        errors.push(`${label}.order duplicates resource[${orders.get(resource.order)}].order (${resource.order}).`);
      } else {
        orders.set(resource.order, index);
      }
    }
  });

  return errors;
}

export function assertValidResources(resources) {
  const errors = validateResources(resources);
  if (errors.length > 0) {
    throw new TypeError(`Invalid catalog:\n- ${errors.join("\n- ")}`);
  }
  return resources;
}
