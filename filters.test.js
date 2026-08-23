import test from "node:test";
import assert from "node:assert/strict";
import { filterLabel, filterRides, toggleFilter } from "./filters.js";

const rides = [
  { name: "A", park: "DL", rank: 1 },
  { name: "B", park: "DL", rank: 2 },
  { name: "C", park: "CA", rank: 1 },
];

test("no filter displays no rides", () => {
  assert.deepEqual(filterRides(rides, new Set()), []);
});

test("park filters select only their park", () => {
  assert.deepEqual(filterRides(rides, new Set(["CA"])).map((ride) => ride.name), ["C"]);
});

test("rank filters select only their rank", () => {
  assert.deepEqual(filterRides(rides, new Set(["1"])).map((ride) => ride.name), ["A", "C"]);
});

test("park and rank filters can be combined", () => {
  assert.deepEqual(filterRides(rides, new Set(["DL", "1"])).map((ride) => ride.name), ["A"]);
});

test("multiple filters in a group are combined", () => {
  assert.deepEqual(filterRides(rides, new Set(["DL", "CA", "2"])).map((ride) => ride.name), ["B"]);
});

test("each filter toggles independently", () => {
  const withDl = toggleFilter(new Set(), "DL");
  const withDlAndOne = toggleFilter(withDl, "1");
  assert.deepEqual([...withDlAndOne], ["DL", "1"]);
  assert.deepEqual([...toggleFilter(withDlAndOne, "DL")], ["1"]);
  assert.equal(filterLabel(new Set()), "Select filters");
  assert.equal(filterLabel(withDlAndOne), "Disneyland · Priority one");
});
