import { filterRides, toggleFilter } from "./filters.js?v=1.3.2";

const SUPABASE_URL = "https://fgomaujsdblpzxhnnqrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JOUqLZDnfGu_yCa6k6FVDQ_AYwpr72i";
const COMPLETED_STORAGE_KEY = "disney-rides-completed-v1";
const SELECTIONS_ENDPOINT = `${SUPABASE_URL}/rest/v1/disney_ride_selections_v1`;

const rideList = document.querySelector("#ride-list");
const status = document.querySelector("#status");
const rideCount = document.querySelector("#ride-count");
const filterButtons = [...document.querySelectorAll(".filter-button")];

let rides = [];
let activeFilters = new Set();
let completedRideIds = new Set();
let pendingRideIds = new Set();

function loadCompletedRideIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

function setFilter(filter) {
  activeFilters = toggleFilter(activeFilters, filter);
  renderFilters();
  renderRides();
}

function renderFilters() {
  filterButtons.forEach((button) => {
    const isActive = activeFilters.has(button.dataset.filter);
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderRides() {
  const visibleRides = filterRides(rides, activeFilters, completedRideIds);
  rideList.replaceChildren(...visibleRides.map(createRideItem));
  rideCount.textContent = `${visibleRides.length} ${visibleRides.length === 1 ? "attraction" : "attractions"}`;
}

function createRideItem(ride) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const circle = document.createElement("span");
  const name = document.createElement("span");
  const meta = document.createElement("span");
  const rideId = String(ride.id);
  const isComplete = completedRideIds.has(rideId);

  item.className = "ride-item";
  item.classList.toggle("is-complete", isComplete);

  button.className = "ride-toggle";
  button.type = "button";
  button.disabled = pendingRideIds.has(rideId);
  button.setAttribute("aria-pressed", String(isComplete));
  button.setAttribute("aria-label", `${isComplete ? "Unmark" : "Mark"} ${ride.name} as complete`);

  circle.className = "circle";
  circle.setAttribute("aria-hidden", "true");
  name.className = "ride-name";
  name.textContent = ride.name;
  meta.className = "ride-meta";
  meta.textContent = `${ride.park} · ${ride.rank}`;

  button.append(circle, name, meta);
  button.addEventListener("click", () => toggleRide(rideId));
  item.append(button);
  return item;
}

function apiHeaders(extra = {}) {
  return { apikey: SUPABASE_PUBLISHABLE_KEY, ...extra };
}

async function fetchSelections() {
  const response = await fetch(`${SELECTIONS_ENDPOINT}?select=ride_id`, {
    headers: apiHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Selections returned ${response.status}`);
  const selections = await response.json();
  return new Set(selections.map(({ ride_id }) => String(ride_id)));
}

async function migrateLocalSelections() {
  const legacyIds = [...loadCompletedRideIds()].filter((id) =>
    rides.some((ride) => String(ride.id) === id),
  );
  if (legacyIds.length === 0) return;

  const response = await fetch(`${SELECTIONS_ENDPOINT}?on_conflict=ride_id`, {
    method: "POST",
    headers: apiHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates",
    }),
    body: JSON.stringify(legacyIds.map((rideId) => ({ ride_id: Number(rideId) }))),
  });
  if (!response.ok) throw new Error(`Selection migration returned ${response.status}`);
  legacyIds.forEach((id) => completedRideIds.add(id));
  localStorage.removeItem(COMPLETED_STORAGE_KEY);
}

async function toggleRide(rideId) {
  if (pendingRideIds.has(rideId)) return;
  const wasComplete = completedRideIds.has(rideId);
  pendingRideIds.add(rideId);
  if (wasComplete) completedRideIds.delete(rideId);
  else completedRideIds.add(rideId);
  renderRides();

  try {
    const response = wasComplete
      ? await fetch(`${SELECTIONS_ENDPOINT}?ride_id=eq.${encodeURIComponent(rideId)}`, {
          method: "DELETE",
          headers: apiHeaders(),
        })
      : await fetch(`${SELECTIONS_ENDPOINT}?on_conflict=ride_id`, {
          method: "POST",
          headers: apiHeaders({
            "Content-Type": "application/json",
            Prefer: "resolution=ignore-duplicates",
          }),
          body: JSON.stringify({ ride_id: Number(rideId) }),
        });
    if (!response.ok) throw new Error(`Selection update returned ${response.status}`);
  } catch (error) {
    console.error(error);
    if (wasComplete) completedRideIds.add(rideId);
    else completedRideIds.delete(rideId);
    rideCount.textContent = "Couldn’t sync — tap again";
  } finally {
    pendingRideIds.delete(rideId);
    renderRides();
  }
}

async function loadRides() {
  try {
    const [response, selections] = await Promise.all([
      fetch(
        `${SUPABASE_URL}/rest/v1/disney_rides_v1?select=id,name,rank,park&order=name.asc`,
        { headers: apiHeaders(), cache: "no-store" },
      ),
      fetchSelections(),
    ]);

    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    rides = await response.json();
    completedRideIds = selections;
    await migrateLocalSelections();
    status.hidden = true;
    renderRides();
  } catch (error) {
    console.error(error);
    status.replaceChildren();
    status.textContent = "The ride list couldn’t load. Please refresh and try again.";
  }
}

async function refreshSelections() {
  try {
    completedRideIds = await fetchSelections();
    renderRides();
  } catch (error) {
    console.error(error);
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

renderFilters();
loadRides();

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && rides.length) refreshSelections();
});
