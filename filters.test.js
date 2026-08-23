import test from "node:test";
import assert from "node:assert/strict";
import { filterLabel, filterRides, nextFilter } from "./filters.js";

const rides = [
  { name: "A", park: "DL", rank: 1 },
  { name: "B", park: "DL", rank: 2 },
  { name: "C", park: "CA", rank: 1 },
];

test("no filter displays every ride", () => {
  assert.deepEqual(filterRides(rides, null), rides);
});

test("park filters select only their park", () => {
  assert.deepEqual(filterRides(rides, "CA").map((ride) => ride.name), ["C"]);
});

test("rank filters select only their rank", () => {
  assert.deepEqual(filterRides(rides, "1").map((ride) => ride.name), ["A", "C"]);
});

test("clicking the active filter restores all filters", () => {
  assert.equal(nextFilter("DL", "DL"), null);
  assert.equal(nextFilter(null, "DL"), "DL");
  assert.equal(filterLabel(null), "All attractions");
});
