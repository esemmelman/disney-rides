export const ALL_FILTERS = ["DL", "CA", "1", "2", "YES", "NO"];

export function filterRides(rides, activeFilters, completedRideIds = new Set()) {
  const selected = new Set(activeFilters);
  if (selected.size === 0) return [];
  const parks = ["DL", "CA"].filter((park) => selected.has(park));
  const ranks = ["1", "2"].filter((rank) => selected.has(rank));
  const completionStatuses = ["YES", "NO"].filter((status) => selected.has(status));

  return rides
    .filter((ride) => {
      const matchesPark = parks.length === 0 || parks.includes(ride.park);
      const matchesRank = ranks.length === 0 || ranks.includes(String(ride.rank));
      const isComplete = completedRideIds.has(String(ride.id));
      const matchesCompletion =
        completionStatuses.length === 0 ||
        (completionStatuses.includes("YES") && isComplete) ||
        (completionStatuses.includes("NO") && !isComplete);
      return matchesPark && matchesRank && matchesCompletion;
    })
    .sort((first, second) => first.name.localeCompare(second.name, undefined, { sensitivity: "base" }));
}

export function toggleFilter(activeFilters, clickedFilter) {
  const next = new Set(activeFilters);
  if (next.has(clickedFilter)) {
    next.delete(clickedFilter);
  } else {
    if (clickedFilter === "1") next.delete("2");
    if (clickedFilter === "2") next.delete("1");
    if (clickedFilter === "YES") next.delete("NO");
    if (clickedFilter === "NO") next.delete("YES");
    next.add(clickedFilter);
  }
  return next;
}

export function filterLabel(activeFilters) {
  const labels = {
    DL: "Disneyland",
    CA: "California Adventure",
    1: "Priority one",
    2: "Priority two",
    YES: "Completed",
    NO: "Not completed",
  };
  const selectedLabels = ALL_FILTERS.filter((filter) => activeFilters.has(filter)).map(
    (filter) => labels[filter],
  );
  return selectedLabels.length ? selectedLabels.join(" · ") : "Select filters";
}
