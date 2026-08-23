export const ALL_FILTERS = ["DL", "CA", "1", "2"];

export function filterRides(rides, activeFilters) {
  const selected = new Set(activeFilters);
  if (selected.size === 0) return [];
  const parks = ["DL", "CA"].filter((park) => selected.has(park));
  const ranks = ["1", "2"].filter((rank) => selected.has(rank));

  return rides
    .filter((ride) => {
      const matchesPark = parks.length === 0 || parks.includes(ride.park);
      const matchesRank = ranks.length === 0 || ranks.includes(String(ride.rank));
      return matchesPark && matchesRank;
    })
    .sort((first, second) => first.name.localeCompare(second.name, undefined, { sensitivity: "base" }));
}

export function toggleFilter(activeFilters, clickedFilter) {
  const next = new Set(activeFilters);
  if (next.has(clickedFilter)) next.delete(clickedFilter);
  else next.add(clickedFilter);
  return next;
}

export function filterLabel(activeFilters) {
  const labels = {
    DL: "Disneyland",
    CA: "California Adventure",
    1: "Priority one",
    2: "Priority two",
  };
  const selectedLabels = ALL_FILTERS.filter((filter) => activeFilters.has(filter)).map(
    (filter) => labels[filter],
  );
  return selectedLabels.length ? selectedLabels.join(" · ") : "Select filters";
}
