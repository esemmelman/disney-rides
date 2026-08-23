import test from "node:test";
import assert from "node:assert/strict";
import { filterLabel, filterRides, toggleFilter } from "./filters.js";

const rides = [
  { id: 1, name: "A", park: "DL", rank: 1 },
  { id: 2, name: "B", park: "DL", rank: 2 },
  { id: 3, name: "C", park: "CA", rank: 1 },
];
const completedRideIds = new Set(["2", "3"]);

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

test("every filtered result is alphabetical by name", () => {
  const unsorted = [rides[2], rides[0], rides[1]];
  assert.deepEqual(filterRides(unsorted, new Set(["DL", "CA"])).map((ride) => ride.name), [
    "A",
    "B",
    "C",
  ]);
});

test("Yes shows only completed rides", () => {
  assert.deepEqual(
    filterRides(rides, new Set(["YES"]), completedRideIds).map((ride) => ride.name),
    ["B", "C"],
  );
});

test("No shows only incomplete rides", () => {
  assert.deepEqual(
    filterRides(rides, new Set(["NO"]), completedRideIds).map((ride) => ride.name),
    ["A"],
  );
});

test("completion, park, and rank filters combine", () => {
  assert.deepEqual(
    filterRides(rides, new Set(["DL", "1", "NO"]), completedRideIds).map(
      (ride) => ride.name,
    ),
    ["A"],
  );
});

test("Yes and No toggle each other off", () => {
  const withYes = toggleFilter(new Set(["DL"]), "YES");
  const withNo = toggleFilter(withYes, "NO");
  assert.deepEqual([...withYes], ["DL", "YES"]);
  assert.deepEqual([...withNo], ["DL", "NO"]);
  assert.equal(withNo.has("YES"), false);
});

test("each filter toggles independently", () => {
  const withDl = toggleFilter(new Set(), "DL");
  const withDlAndOne = toggleFilter(withDl, "1");
  assert.deepEqual([...withDlAndOne], ["DL", "1"]);
  assert.deepEqual([...toggleFilter(withDlAndOne, "DL")], ["1"]);
  assert.equal(filterLabel(new Set()), "Select filters");
  assert.equal(filterLabel(withDlAndOne), "Disneyland · Priority one");
});
