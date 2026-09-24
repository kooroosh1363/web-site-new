import { readFile } from "node:fs/promises";
import { assertValidResources } from "../js/resource-schema.js";

const path = new URL("../data/resources.json", import.meta.url);
const resources = JSON.parse(await readFile(path, "utf8"));

assertValidResources(resources);
console.log(`Validated ${resources.length} catalog resources.`);
