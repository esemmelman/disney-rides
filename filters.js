export const ALL_FILTERS = ["DL", "CA", "1", "2"];

export function filterRides(rides, activeFilter) {
  if (!activeFilter) return rides;
  if (activeFilter === "DL" || activeFilter === "CA") {
    return rides.filter((ride) => ride.park === activeFilter);
  }
  return rides.filter((ride) => String(ride.rank) === activeFilter);
}

export function nextFilter(currentFilter, clickedFilter) {
  return currentFilter === clickedFilter ? null : clickedFilter;
}

export function filterLabel(activeFilter) {
  const labels = {
    DL: "Disneyland",
    CA: "California Adventure",
    1: "Priority one",
    2: "Priority two",
  };
  return activeFilter ? labels[activeFilter] : "All attractions";
}
