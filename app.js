import { filterLabel, filterRides, toggleFilter } from "./filters.js";

const SUPABASE_URL = "https://fgomaujsdblpzxhnnqrg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_JOUqLZDnfGu_yCa6k6FVDQ_AYwpr72i";
const COMPLETED_STORAGE_KEY = "disney-rides-completed-v1";

const rideList = document.querySelector("#ride-list");
const status = document.querySelector("#status");
const rideCount = document.querySelector("#ride-count");
const filterLabelElement = document.querySelector("#filter-label");
const filterButtons = [...document.querySelectorAll(".filter-button")];

let rides = [];
let activeFilters = new Set();
let completedRideIds = loadCompletedRideIds();

function loadCompletedRideIds() {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPLETED_STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(stored) ? stored.map(String) : []);
  } catch {
    return new Set();
  }
}

function saveCompletedRideIds() {
  localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify([...completedRideIds]));
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
  filterLabelElement.textContent = filterLabel(activeFilters);
}

function renderRides() {
  const visibleRides = filterRides(rides, activeFilters);
  rideList.replaceChildren(...visibleRides.map(createRideItem));
  rideCount.textContent = `${visibleRides.length} ${visibleRides.length === 1 ? "attraction" : "attractions"}`;
}

function createRideItem(ride) {
  const item = document.createElement("li");
  const button = document.createElement("button");
  const oval = document.createElement("span");
  const name = document.createElement("span");
  const meta = document.createElement("span");
  const rideId = String(ride.id);
  const isComplete = completedRideIds.has(rideId);

  item.className = "ride-item";
  item.classList.toggle("is-complete", isComplete);

  button.className = "ride-toggle";
  button.type = "button";
  button.setAttribute("aria-pressed", String(isComplete));
  button.setAttribute("aria-label", `${isComplete ? "Unmark" : "Mark"} ${ride.name} as complete`);

  oval.className = "oval";
  oval.setAttribute("aria-hidden", "true");
  name.className = "ride-name";
  name.textContent = ride.name;
  meta.className = "ride-meta";
  meta.textContent = `${ride.park} · ${ride.rank}`;

  button.append(oval, name, meta);
  button.addEventListener("click", () => {
    if (completedRideIds.has(rideId)) completedRideIds.delete(rideId);
    else completedRideIds.add(rideId);
    saveCompletedRideIds();
    renderRides();
  });
  item.append(button);
  return item;
}

async function loadRides() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/disney_rides_v1?select=id,name,rank,park&order=park.desc,rank.asc,name.asc`,
      {
        headers: {
          apikey: SUPABASE_PUBLISHABLE_KEY,
        },
      },
    );

    if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
    rides = await response.json();
    status.hidden = true;
    renderRides();
  } catch (error) {
    console.error(error);
    status.replaceChildren();
    status.textContent = "The ride list couldn’t load. Please refresh and try again.";
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

renderFilters();
loadRides();
