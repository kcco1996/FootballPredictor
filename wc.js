import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


/* =========================================================
   FIREBASE SETUP
========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCfiE1Qf3z_fwd6E9mppHWqg_H8H8qeKUM",
  authDomain: "footballpredictor-28368.firebaseapp.com",
  projectId: "footballpredictor-28368",
  storageBucket: "footballpredictor-28368.firebasestorage.app",
  messagingSenderId: "52688713927",
  appId: "1:52688713927:web:451c9ac16b516fdaba66e2"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const provider = new GoogleAuthProvider();

let currentUser = null;
let firebaseReady = false;

const ENGLISH_LEAGUES_PAGE = "index.html";


/* =========================================================
   TOURNAMENT SETTINGS
========================================================= */

const TOURNAMENT_SIZE = 64;
const FINAL_GROUP_COUNT = 16;
const TEAMS_PER_FINAL_GROUP = 4;

const continentNames = {
  uefa: "Europe",
  caf: "Africa",
  afc: "Asia",
  concacaf: "North America and Caribbean",
  conmebol: "South America",
  ofc: "Oceania"
};

const continentCodes = {
  uefa: "UEFA",
  caf: "CAF",
  afc: "AFC",
  concacaf: "CONCACAF",
  conmebol: "CONMEBOL",
  ofc: "OFC"
};


/* =========================================================
   AUTOMATIC QUALIFIERS
========================================================= */

const automaticQualifiers = [
  {
    name: "Morocco",
    continent: "caf",
    status: "Host Nation"
  },
  {
    name: "Portugal",
    continent: "uefa",
    status: "Host Nation"
  },
  {
    name: "Spain",
    continent: "uefa",
    status: "Host Nation"
  },
  {
    name: "Argentina",
    continent: "conmebol",
    status: "Centenary Host"
  },
  {
    name: "Paraguay",
    continent: "conmebol",
    status: "Centenary Host"
  },
  {
    name: "Uruguay",
    continent: "conmebol",
    status: "Centenary Host"
  }
];


/* =========================================================
   FLAG HELPERS
========================================================= */

const specialFlagFiles = {
  "United States": "usa",
  "USA": "usa",
  "South Korea": "south-korea",
  "North Korea": "north-korea",
  "Czech Republic": "czech-republic",
  "Czechia": "czech-republic",
  "Bosnia and Herzegovina": "bosnia-and-herzegovina",
  "Ivory Coast": "ivory-coast",
  "Côte d'Ivoire": "ivory-coast",
  "DR Congo": "dr-congo",
  "Democratic Republic of the Congo": "dr-congo",
  "Republic of Ireland": "republic-of-ireland",
  "Northern Ireland": "northern-ireland",
  "Saudi Arabia": "saudi-arabia",
  "New Zealand": "new-zealand",
  "South Africa": "south-africa",
  "Cape Verde": "cape-verde",
  "Costa Rica": "costa-rica",
  "El Salvador": "el-salvador",
  "Trinidad and Tobago": "trinidad-and-tobago",
  "United Arab Emirates": "united-arab-emirates",
  "Papua New Guinea": "papua-new-guinea",
  "Solomon Islands": "solomon-islands",
  "Faroe Islands": "faroe-islands",
  "North Macedonia": "north-macedonia",
  "San Marino": "san-marino",
  "Burkina Faso": "burkina-faso",
  "Sierra Leone": "sierra-leone",
  "Equatorial Guinea": "equatorial-guinea",
  "Guinea-Bissau": "guinea-bissau",
  "Central African Republic": "central-african-republic"
};

function createFlagSlug(teamName) {
  if (specialFlagFiles[teamName]) {
    return specialFlagFiles[teamName];
  }

  return teamName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFlagPath(teamName) {
  return `assets/flags/${createFlagSlug(teamName)}.png`;
}

function getFlag(teamName) {
  const safeName = escapeHTML(teamName);

  return `
    <img
      class="flag"
      src="${getFlagPath(teamName)}"
      alt="${safeName} flag"
      onerror="this.style.display='none'"
    >
  `;
}

function teamWithFlag(teamName) {
  return `
    <div class="team-cell">
      ${getFlag(teamName)}
      <span class="team-name">${escapeHTML(teamName)}</span>
    </div>
  `;
}


/* =========================================================
   STATE
========================================================= */

function createDefaultState() {
  return {
    continents: {
      uefa: {
        groups: []
      },
      caf: {
        groups: []
      },
      afc: {
        groups: []
      },
      concacaf: {
        groups: []
      },
      conmebol: {
        groups: []
      },
      ofc: {
        groups: []
      }
    },

    playoffMatches: [],

    qualifiedTeams: automaticQualifiers.map(team => ({
      ...team,
      automatic: true
    })),

    finalDraw: {}
  };
}

let state = loadLocalState();


/* =========================================================
   DOM ELEMENTS
========================================================= */

const qualifiedCount = document.getElementById("qualifiedCount");
const remainingPlaces = document.getElementById("remainingPlaces");

const qualifiedList = document.getElementById("qualifiedList");
const qualifiedContinentFilter = document.getElementById(
  "qualifiedContinentFilter"
);

const playoffGrid = document.getElementById("playoffGrid");
const worldCupGroups = document.getElementById("worldCupGroups");

const drawWorldCupBtn = document.getElementById("drawWorldCupBtn");
const clearWorldCupDrawBtn = document.getElementById(
  "clearWorldCupDrawBtn"
);

const addPlayoffBtn = document.getElementById("addPlayoffBtn");
const resetAllBtn = document.getElementById("resetAllBtn");


/* =========================================================
   GENERAL HELPERS
========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function getGroupLetter(index) {
  return String.fromCharCode(65 + index);
}

function normaliseTeamName(teamName) {
  return teamName.trim().replace(/\s+/g, " ");
}

function teamAlreadyExists(teamName) {
  const normalised = teamName.toLowerCase();

  if (
    automaticQualifiers.some(
      team => team.name.toLowerCase() === normalised
    )
  ) {
    return true;
  }

  return Object.values(state.continents).some(continent =>
    continent.groups.some(group =>
      group.teams.some(
        team => team.name.toLowerCase() === normalised
      )
    )
  );
}

function getAllContinentalTeams() {
  const teams = [];

  Object.entries(state.continents).forEach(
    ([continentId, continent]) => {
      continent.groups.forEach(group => {
        group.teams.forEach(team => {
          teams.push({
            ...team,
            continent: continentId,
            groupId: group.id,
            groupName: group.name
          });
        });
      });
    }
  );

  return teams;
}

function findTeam(teamId) {
  for (const [continentId, continent] of Object.entries(
    state.continents
  )) {
    for (const group of continent.groups) {
      const team = group.teams.find(item => item.id === teamId);

      if (team) {
        return {
          team,
          group,
          continentId
        };
      }
    }
  }

  return null;
}

function findGroup(continentId, groupId) {
  return state.continents[continentId]?.groups.find(
    group => group.id === groupId
  );
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadLocalState() {
  try {
    const savedState = localStorage.getItem(
      "worldCup2030QualifierState"
    );

    if (!savedState) {
      return createDefaultState();
    }

    const parsedState = JSON.parse(savedState);
    const defaultState = createDefaultState();

    return {
      ...defaultState,
      ...parsedState,
      continents: {
        ...defaultState.continents,
        ...(parsedState.continents || {})
      },
      qualifiedTeams:
        parsedState.qualifiedTeams ||
        defaultState.qualifiedTeams,
      playoffMatches: parsedState.playoffMatches || [],
      finalDraw: parsedState.finalDraw || {}
    };
  } catch (error) {
    console.error("Unable to load local data:", error);
    return createDefaultState();
  }
}

function saveLocalState() {
  localStorage.setItem(
    "worldCup2030QualifierState",
    JSON.stringify(state)
  );
}

function saveState() {
  saveLocalState();
  saveToFirebase();
}


/* =========================================================
   FIREBASE SAVE AND LOAD
========================================================= */

async function saveToFirebase() {
  if (!currentUser || !firebaseReady) {
    return;
  }

  try {
    await setDoc(
      doc(db, "worldCup2030Qualifiers", currentUser.uid),
      {
        state,
        updatedAt: new Date().toISOString()
      },
      {
        merge: true
      }
    );
  } catch (error) {
    console.error("Unable to save qualifying data:", error);
  }
}

async function loadFromFirebase() {
  if (!currentUser) {
    return;
  }

  try {
    const snapshot = await getDoc(
      doc(db, "worldCup2030Qualifiers", currentUser.uid)
    );

    if (!snapshot.exists()) {
      await saveToFirebase();
      return;
    }

    const data = snapshot.data();

    if (data.state) {
      state = data.state;
      ensureAutomaticQualifiers();
      saveLocalState();
    }
  } catch (error) {
    console.error("Unable to load qualifying data:", error);
  }
}

function ensureAutomaticQualifiers() {
  if (!Array.isArray(state.qualifiedTeams)) {
    state.qualifiedTeams = [];
  }

  automaticQualifiers.forEach(host => {
    const alreadyIncluded = state.qualifiedTeams.some(
      team =>
        team.name.toLowerCase() === host.name.toLowerCase()
    );

    if (!alreadyIncluded) {
      state.qualifiedTeams.push({
        ...host,
        automatic: true
      });
    }
  });
}


/* =========================================================
   HEADER CONTROLS
========================================================= */

function createHeaderControls() {
  const header = document.querySelector(".app-header");

  if (!header || document.querySelector(".header-controls")) {
    return;
  }

  const controls = document.createElement("div");
  controls.className = "header-controls";

  controls.innerHTML = `
    <a
      class="english-leagues-btn"
      href="${ENGLISH_LEAGUES_PAGE}"
    >
      🏴 English Leagues
    </a>

    <button
      id="loginBtn"
      class="secondary-btn"
      type="button"
    >
      Sign in
    </button>

    <button
      id="logoutBtn"
      class="secondary-btn"
      type="button"
      style="display:none;"
    >
      Sign out
    </button>

    <p id="userStatus" class="user-status">
      Not signed in
    </p>
  `;

  header.appendChild(controls);

  document
    .getElementById("loginBtn")
    .addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Sign-in failed:", error);
        alert("Google sign-in was unsuccessful.");
      }
    });

  document
    .getElementById("logoutBtn")
    .addEventListener("click", async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Sign-out failed:", error);
      }
    });
}


/* =========================================================
   CONTINENT NAVIGATION
========================================================= */

function initialiseContinentNavigation() {
  const buttons = document.querySelectorAll(".continent-btn");
  const panels = document.querySelectorAll(".continent-panel");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const selectedContinent = button.dataset.continent;

      buttons.forEach(item => {
        item.classList.toggle(
          "active",
          item === button
        );
      });

      panels.forEach(panel => {
        panel.classList.toggle(
          "active",
          panel.dataset.continentPanel === selectedContinent
        );
      });
    });
  });
}


/* =========================================================
   GROUP CREATION
========================================================= */

function addGroup(continentId) {
  const continent = state.continents[continentId];

  if (!continent) {
    return;
  }

  const defaultName =
    continentId === "conmebol" && continent.groups.length === 0
      ? "South American League"
      : `Group ${getGroupLetter(continent.groups.length)}`;

  const enteredName = prompt(
    "Enter a name for this group or league:",
    defaultName
  );

  if (enteredName === null) {
    return;
  }

  const groupName = enteredName.trim() || defaultName;

  continent.groups.push({
    id: generateId("group"),
    name: groupName,
    teams: [],
    results: {}
  });

  saveState();
  renderEverything();
}

function removeGroup(continentId, groupId) {
  const group = findGroup(continentId, groupId);

  if (!group) {
    return;
  }

  const confirmed = confirm(
    `Delete ${group.name} and all of its results?`
  );

  if (!confirmed) {
    return;
  }

  group.teams.forEach(team => {
    removeQualifiedTeam(team.id, false);
  });

  state.continents[continentId].groups =
    state.continents[continentId].groups.filter(
      item => item.id !== groupId
    );

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function renameGroup(continentId, groupId) {
  const group = findGroup(continentId, groupId);

  if (!group) {
    return;
  }

  const newName = prompt("Rename this group:", group.name);

  if (newName === null || !newName.trim()) {
    return;
  }

  group.name = newName.trim();

  saveState();
  renderEverything();
}


/* =========================================================
   TEAM CREATION
========================================================= */

function selectGroupForTeam(continentId) {
  const continent = state.continents[continentId];

  if (!continent || continent.groups.length === 0) {
    alert("Create a group before adding a team.");
    return null;
  }

  if (continent.groups.length === 1) {
    return continent.groups[0];
  }

  const groupOptions = continent.groups
    .map(
      (group, index) =>
        `${index + 1}. ${group.name}`
    )
    .join("\n");

  const selection = prompt(
    `Which group should receive the team?\n\n${groupOptions}`,
    "1"
  );

  if (selection === null) {
    return null;
  }

  const selectedIndex = Number(selection) - 1;

  if (
    !Number.isInteger(selectedIndex) ||
    selectedIndex < 0 ||
    selectedIndex >= continent.groups.length
  ) {
    alert("That group selection was not valid.");
    return null;
  }

  return continent.groups[selectedIndex];
}

function addTeam(continentId, chosenGroupId = null) {
  const continent = state.continents[continentId];

  if (!continent) {
    return;
  }

  let group = null;

  if (chosenGroupId) {
    group = findGroup(continentId, chosenGroupId);
  } else {
    group = selectGroupForTeam(continentId);
  }

  if (!group) {
    return;
  }

  const enteredName = prompt(
    `Enter the country to add to ${group.name}:`
  );

  if (enteredName === null) {
    return;
  }

  const teamName = normaliseTeamName(enteredName);

  if (!teamName) {
    return;
  }

  if (teamAlreadyExists(teamName)) {
    alert(`${teamName} has already been added.`);
    return;
  }

  group.teams.push({
    id: generateId("team"),
    name: teamName
  });

  group.results = {};

  saveState();
  renderEverything();
}

function removeTeam(continentId, groupId, teamId) {
  const group = findGroup(continentId, groupId);

  if (!group) {
    return;
  }

  const team = group.teams.find(item => item.id === teamId);

  if (!team) {
    return;
  }

  const confirmed = confirm(
    `Remove ${team.name} from ${group.name}?`
  );

  if (!confirmed) {
    return;
  }

  group.teams = group.teams.filter(
    item => item.id !== teamId
  );

  group.results = {};

  removeQualifiedTeam(teamId, false);
  state.finalDraw = {};

  saveState();
  renderEverything();
}

function moveTeam(continentId, groupId, teamId) {
  const currentGroup = findGroup(continentId, groupId);
  const continent = state.continents[continentId];

  if (!currentGroup || continent.groups.length < 2) {
    alert("Create another group before moving this team.");
    return;
  }

  const team = currentGroup.teams.find(
    item => item.id === teamId
  );

  if (!team) {
    return;
  }

  const otherGroups = continent.groups.filter(
    group => group.id !== groupId
  );

  const options = otherGroups
    .map(
      (group, index) => `${index + 1}. ${group.name}`
    )
    .join("\n");

  const selection = prompt(
    `Move ${team.name} to which group?\n\n${options}`,
    "1"
  );

  if (selection === null) {
    return;
  }

  const selectedIndex = Number(selection) - 1;
  const newGroup = otherGroups[selectedIndex];

  if (!newGroup) {
    alert("That group selection was not valid.");
    return;
  }

  currentGroup.teams = currentGroup.teams.filter(
    item => item.id !== teamId
  );

  currentGroup.results = {};

  newGroup.teams.push(team);
  newGroup.results = {};

  saveState();
  renderEverything();
}


/* =========================================================
   FIXTURES
========================================================= */

function createGroupFixtures(group) {
  const fixtures = [];

  for (let i = 0; i < group.teams.length; i++) {
    for (let j = i + 1; j < group.teams.length; j++) {
      fixtures.push({
        id: `${group.teams[i].id}-${group.teams[j].id}`,
        home: group.teams[i],
        away: group.teams[j]
      });
    }
  }

  return fixtures;
}

function updateGroupScore(
  continentId,
  groupId,
  fixtureId,
  side,
  value
) {
  const group = findGroup(continentId, groupId);

  if (!group) {
    return;
  }

  if (!group.results) {
    group.results = {};
  }

  if (!group.results[fixtureId]) {
    group.results[fixtureId] = {
      home: "",
      away: ""
    };
  }

  group.results[fixtureId][side] =
    value === "" ? "" : Math.max(0, Number(value));

  saveState();
  renderEverything();
}


/* =========================================================
   TABLE CALCULATION
========================================================= */

function createBlankStats(team) {
  return {
    id: team.id,
    name: team.name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0
  };
}

function sortTableTeams(teamA, teamB) {
  return (
    teamB.points - teamA.points ||
    teamB.gd - teamA.gd ||
    teamB.gf - teamA.gf ||
    teamA.name.localeCompare(teamB.name)
  );
}

function calculateGroupTable(group) {
  const table = {};

  group.teams.forEach(team => {
    table[team.id] = createBlankStats(team);
  });

  const fixtures = createGroupFixtures(group);

  fixtures.forEach(fixture => {
    const result = group.results?.[fixture.id];

    if (
      !result ||
      result.home === "" ||
      result.away === "" ||
      result.home === undefined ||
      result.away === undefined
    ) {
      return;
    }

    const homeGoals = Number(result.home);
    const awayGoals = Number(result.away);

    const homeStats = table[fixture.home.id];
    const awayStats = table[fixture.away.id];

    if (!homeStats || !awayStats) {
      return;
    }

    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.gf += homeGoals;
    homeStats.ga += awayGoals;

    awayStats.gf += awayGoals;
    awayStats.ga += homeGoals;

    if (homeGoals > awayGoals) {
      homeStats.won += 1;
      homeStats.points += 3;
      awayStats.lost += 1;
    } else if (awayGoals > homeGoals) {
      awayStats.won += 1;
      awayStats.points += 3;
      homeStats.lost += 1;
    } else {
      homeStats.drawn += 1;
      awayStats.drawn += 1;

      homeStats.points += 1;
      awayStats.points += 1;
    }

    homeStats.gd = homeStats.gf - homeStats.ga;
    awayStats.gd = awayStats.gf - awayStats.ga;
  });

  return Object.values(table).sort(sortTableTeams);
}


/* =========================================================
   QUALIFICATION
========================================================= */

function isTeamQualified(teamId) {
  return state.qualifiedTeams.some(
    team => team.id === teamId
  );
}

function qualifyTeam(teamId) {
  if (state.qualifiedTeams.length >= TOURNAMENT_SIZE) {
    alert(
      "All 64 tournament places have already been filled."
    );
    return;
  }

  const found = findTeam(teamId);

  if (!found || isTeamQualified(teamId)) {
    return;
  }

  state.qualifiedTeams.push({
    id: found.team.id,
    name: found.team.name,
    continent: found.continentId,
    status: `${found.group.name} qualifier`,
    automatic: false
  });

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function removeQualifiedTeam(teamId, shouldRender = true) {
  state.qualifiedTeams = state.qualifiedTeams.filter(
    team => team.automatic || team.id !== teamId
  );

  state.finalDraw = {};

  if (shouldRender) {
    saveState();
    renderEverything();
  }
}

function toggleQualification(teamId) {
  if (isTeamQualified(teamId)) {
    removeQualifiedTeam(teamId);
  } else {
    qualifyTeam(teamId);
  }
}


/* =========================================================
   GROUP RENDERING
========================================================= */

function renderContinentGroups(continentId) {
  const container = document.getElementById(
    `${continentId}Groups`
  );

  if (!container) {
    return;
  }

  const continent = state.continents[continentId];
  container.innerHTML = "";

  if (!continent || continent.groups.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">⚽</span>

        <p>
          No ${escapeHTML(
            continentNames[continentId]
          )} groups have been created.
        </p>

        <button
          type="button"
          class="primary-btn"
          data-action="add-group"
          data-continent="${continentId}"
        >
          Create First Group
        </button>
      </div>
    `;

    return;
  }

  continent.groups.forEach(group => {
    const table = calculateGroupTable(group);
    const fixtures = createGroupFixtures(group);

    const groupCard = document.createElement("article");
    groupCard.className = "group-table";

    groupCard.innerHTML = `
      <div class="group-heading">
        <h3>${escapeHTML(group.name)}</h3>

        <div class="stage-actions">
          <button
            type="button"
            class="secondary-btn"
            data-action="rename-group"
            data-continent="${continentId}"
            data-group="${group.id}"
          >
            Rename
          </button>

          <button
            type="button"
            class="secondary-btn"
            data-action="add-team"
            data-continent="${continentId}"
            data-group="${group.id}"
          >
            Add Team
          </button>

          <button
            type="button"
            class="danger-btn"
            data-action="remove-group"
            data-continent="${continentId}"
            data-group="${group.id}"
          >
            Delete
          </button>
        </div>
      </div>

      ${
        group.teams.length === 0
          ? `
            <div class="empty-state">
              <p>No teams have been added to this group.</p>
            </div>
          `
          : `
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>W</th>
                    <th>D</th>
                    <th>L</th>
                    <th>GF</th>
                    <th>GA</th>
                    <th>GD</th>
                    <th>Pts</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  ${table
                    .map((team, index) => {
                      const qualified = isTeamQualified(team.id);

                      return `
                        <tr class="${
                          qualified
                            ? "qualifies-directly"
                            : ""
                        }">
                          <td>${index + 1}</td>

                          <td>
                            ${teamWithFlag(team.name)}
                          </td>

                          <td>${team.played}</td>
                          <td>${team.won}</td>
                          <td>${team.drawn}</td>
                          <td>${team.lost}</td>
                          <td>${team.gf}</td>
                          <td>${team.ga}</td>
                          <td>${team.gd}</td>
                          <td>
                            <strong>${team.points}</strong>
                          </td>

                          <td>
                            ${
                              qualified
                                ? '<span class="badge">Qualified</span>'
                                : "Not qualified"
                            }
                          </td>

                          <td>
                            <button
                              type="button"
                              class="${
                                qualified
                                  ? "danger-btn"
                                  : "primary-btn"
                              }"
                              data-action="toggle-qualified"
                              data-team="${team.id}"
                            >
                              ${
                                qualified
                                  ? "Remove"
                                  : "Qualify"
                              }
                            </button>

                            <button
                              type="button"
                              class="secondary-btn"
                              data-action="move-team"
                              data-continent="${continentId}"
                              data-group="${group.id}"
                              data-team="${team.id}"
                            >
                              Move
                            </button>

                            <button
                              type="button"
                              class="danger-btn"
                              data-action="remove-team"
                              data-continent="${continentId}"
                              data-group="${group.id}"
                              data-team="${team.id}"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      `;
                    })
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="position-key">
              <span class="key-item">
                <span class="key-colour key-direct"></span>
                Qualified for World Cup
              </span>
            </div>
          `
      }

      ${
        fixtures.length === 0
          ? ""
          : `
            <div class="section-header">
              <div>
                <p class="eyebrow">Group Matches</p>
                <h3>Fixtures</h3>
              </div>
            </div>

            <div class="fixtures-list">
              ${fixtures
                .map(fixture => {
                  const result =
                    group.results?.[fixture.id] || {};

                  return `
                    <div class="fixture">
                      <div class="fixture-group">
                        ${escapeHTML(group.name)}
                      </div>

                      <div class="home">
                        ${teamWithFlag(fixture.home.name)}
                      </div>

                      <input
                        type="number"
                        min="0"
                        class="score-input"
                        value="${result.home ?? ""}"
                        data-action="group-score"
                        data-continent="${continentId}"
                        data-group="${group.id}"
                        data-fixture="${fixture.id}"
                        data-side="home"
                      >

                      <span>-</span>

                      <input
                        type="number"
                        min="0"
                        class="score-input"
                        value="${result.away ?? ""}"
                        data-action="group-score"
                        data-continent="${continentId}"
                        data-group="${group.id}"
                        data-fixture="${fixture.id}"
                        data-side="away"
                      >

                      <div class="away">
                        ${teamWithFlag(fixture.away.name)}
                      </div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          `
      }
    `;

    container.appendChild(groupCard);
  });
}


/* =========================================================
   CONTINENT STATISTICS
========================================================= */

function renderContinentStatistics() {
  Object.entries(state.continents).forEach(
    ([continentId, continent]) => {
      const groupCountElement = document.getElementById(
        `${continentId}GroupCount`
      );

      const teamCountElement = document.getElementById(
        `${continentId}TeamCount`
      );

      const qualifiedCountElement = document.getElementById(
        `${continentId}QualifiedCount`
      );

      const teamCount = continent.groups.reduce(
        (total, group) => total + group.teams.length,
        0
      );

      const continentQualifiedCount =
        state.qualifiedTeams.filter(
          team => team.continent === continentId
        ).length;

      if (groupCountElement) {
        groupCountElement.textContent =
          continent.groups.length;
      }

      if (teamCountElement) {
        teamCountElement.textContent = teamCount;
      }

      if (qualifiedCountElement) {
        qualifiedCountElement.textContent =
          continentQualifiedCount;
      }
    }
  );
}


/* =========================================================
   QUALIFIED TEAM LIST
========================================================= */

function renderQualifiedTeams() {
  if (!qualifiedList) {
    return;
  }

  const selectedContinent =
    qualifiedContinentFilter?.value || "all";

  const teams = state.qualifiedTeams.filter(team => {
    return (
      selectedContinent === "all" ||
      team.continent === selectedContinent
    );
  });

  qualifiedList.innerHTML = "";

  if (teams.length === 0) {
    qualifiedList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🏳️</span>
        <p>No qualified teams match this filter.</p>
      </div>
    `;

    return;
  }

  teams
    .sort((teamA, teamB) =>
      teamA.name.localeCompare(teamB.name)
    )
    .forEach(team => {
      const card = document.createElement("article");

      card.className = `qualified-card ${
        team.automatic ? "host-qualified" : ""
      }`;

      card.innerHTML = `
        <span class="badge">
          ${escapeHTML(team.status)}
        </span>

        <h3>
          ${teamWithFlag(team.name)}
        </h3>

        <span class="confederation-badge">
          ${continentCodes[team.continent] || ""}
        </span>

        ${
          team.automatic
            ? ""
            : `
              <button
                type="button"
                class="danger-btn"
                data-action="remove-qualified"
                data-team="${team.id}"
              >
                Remove Qualification
              </button>
            `
        }
      `;

      qualifiedList.appendChild(card);
    });
}


/* =========================================================
   SUMMARY COUNTS
========================================================= */

function renderSummary() {
  const totalQualified = state.qualifiedTeams.length;
  const placesRemaining = Math.max(
    0,
    TOURNAMENT_SIZE - totalQualified
  );

  if (qualifiedCount) {
    qualifiedCount.textContent = totalQualified;
  }

  if (remainingPlaces) {
    remainingPlaces.textContent = placesRemaining;
  }
}


/* =========================================================
   INTERCONTINENTAL PLAYOFFS
========================================================= */

function addPlayoffMatch() {
  state.playoffMatches.push({
    id: generateId("playoff"),
    homeTeam: "",
    awayTeam: "",
    homeScore: "",
    awayScore: "",
    winner: ""
  });

  saveState();
  renderEverything();
}

function removePlayoffMatch(matchId) {
  state.playoffMatches = state.playoffMatches.filter(
    match => match.id !== matchId
  );

  saveState();
  renderEverything();
}

function updatePlayoffMatch(matchId, field, value) {
  const match = state.playoffMatches.find(
    item => item.id === matchId
  );

  if (!match) {
    return;
  }

  if (field === "homeScore" || field === "awayScore") {
    match[field] =
      value === "" ? "" : Math.max(0, Number(value));
  } else {
    match[field] = value;
  }

  saveState();
  renderEverything();
}

function qualifyPlayoffWinner(matchId) {
  const match = state.playoffMatches.find(
    item => item.id === matchId
  );

  if (!match) {
    return;
  }

  const homeScore = Number(match.homeScore);
  const awayScore = Number(match.awayScore);

  if (
    match.homeScore === "" ||
    match.awayScore === ""
  ) {
    alert("Enter both playoff scores first.");
    return;
  }

  if (homeScore === awayScore) {
    alert(
      "The playoff cannot finish level. Enter a winning score."
    );
    return;
  }

  const winner =
    homeScore > awayScore
      ? normaliseTeamName(match.homeTeam)
      : normaliseTeamName(match.awayTeam);

  if (!winner) {
    alert("Enter both playoff countries first.");
    return;
  }

  const existingTeam = state.qualifiedTeams.some(
    team => team.name.toLowerCase() === winner.toLowerCase()
  );

  if (existingTeam) {
    alert(`${winner} is already qualified.`);
    return;
  }

  if (state.qualifiedTeams.length >= TOURNAMENT_SIZE) {
    alert("All 64 tournament places are already filled.");
    return;
  }

  state.qualifiedTeams.push({
    id: generateId("playoff-winner"),
    name: winner,
    continent: "playoff",
    status: "Intercontinental Playoff Winner",
    automatic: false
  });

  match.winner = winner;
  state.finalDraw = {};

  saveState();
  renderEverything();
}

function renderPlayoffs() {
  if (!playoffGrid) {
    return;
  }

  playoffGrid.innerHTML = "";

  if (state.playoffMatches.length === 0) {
    playoffGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🏟️</span>
        <p>No intercontinental playoff matches have been created.</p>
      </div>
    `;

    return;
  }

  state.playoffMatches.forEach((match, index) => {
    const card = document.createElement("article");
    card.className = "playoff-card";

    card.innerHTML = `
      <div class="section-header">
        <h3>Playoff ${index + 1}</h3>

        <button
          type="button"
          class="danger-btn"
          data-action="remove-playoff"
          data-match="${match.id}"
        >
          Delete
        </button>
      </div>

      <div class="playoff-team">
        <input
          type="text"
          class="team-input"
          placeholder="First country"
          value="${escapeHTML(match.homeTeam)}"
          data-action="playoff-input"
          data-match="${match.id}"
          data-field="homeTeam"
        >

        <input
          type="number"
          min="0"
          class="playoff-score"
          value="${match.homeScore}"
          data-action="playoff-input"
          data-match="${match.id}"
          data-field="homeScore"
        >
      </div>

      <div class="playoff-team">
        <input
          type="text"
          class="team-input"
          placeholder="Second country"
          value="${escapeHTML(match.awayTeam)}"
          data-action="playoff-input"
          data-match="${match.id}"
          data-field="awayTeam"
        >

        <input
          type="number"
          min="0"
          class="playoff-score"
          value="${match.awayScore}"
          data-action="playoff-input"
          data-match="${match.id}"
          data-field="awayScore"
        >
      </div>

      ${
        match.winner
          ? `
            <span class="badge">
              ${escapeHTML(match.winner)} qualified
            </span>
          `
          : `
            <button
              type="button"
              class="primary-btn"
              data-action="qualify-playoff"
              data-match="${match.id}"
            >
              Qualify Winner
            </button>
          `
      }
    `;

    playoffGrid.appendChild(card);
  });
}


/* =========================================================
   64-TEAM WORLD CUP DRAW
========================================================= */

function shuffleArray(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

function drawWorldCupGroups() {
  if (state.qualifiedTeams.length !== TOURNAMENT_SIZE) {
    alert(
      `You need exactly 64 qualified teams. You currently have ${state.qualifiedTeams.length}.`
    );

    return;
  }

  const shuffledTeams = shuffleArray(
    state.qualifiedTeams
  );

  const newDraw = {};

  for (
    let groupIndex = 0;
    groupIndex < FINAL_GROUP_COUNT;
    groupIndex++
  ) {
    const groupLetter = getGroupLetter(groupIndex);
    const startIndex =
      groupIndex * TEAMS_PER_FINAL_GROUP;

    newDraw[groupLetter] = shuffledTeams.slice(
      startIndex,
      startIndex + TEAMS_PER_FINAL_GROUP
    );
  }

  state.finalDraw = newDraw;

  saveState();
  renderEverything();
}

function clearWorldCupDraw() {
  if (
    Object.keys(state.finalDraw || {}).length === 0
  ) {
    return;
  }

  const confirmed = confirm(
    "Clear the current 16-group World Cup draw?"
  );

  if (!confirmed) {
    return;
  }

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function renderWorldCupDraw() {
  if (!worldCupGroups) {
    return;
  }

  worldCupGroups.innerHTML = "";

  const groups = Object.entries(state.finalDraw || {});

  if (groups.length === 0) {
    const message =
      state.qualifiedTeams.length === TOURNAMENT_SIZE
        ? "All 64 teams are ready. Press Draw 16 Groups."
        : `The draw becomes available when 64 teams have qualified. ${state.qualifiedTeams.length} of 64 places are currently filled.`;

    worldCupGroups.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🎲</span>
        <p>${message}</p>
      </div>
    `;

    return;
  }

  groups.forEach(([groupLetter, teams]) => {
    const card = document.createElement("article");
    card.className = "group-table";

    card.innerHTML = `
      <h3>Group ${groupLetter}</h3>

      <table>
        <thead>
          <tr>
            <th>Position</th>
            <th>Country</th>
            <th>Confederation</th>
          </tr>
        </thead>

        <tbody>
          ${teams
            .map(
              (team, index) => `
                <tr>
                  <td>${index + 1}</td>

                  <td>
                    ${teamWithFlag(team.name)}
                  </td>

                  <td>
                    ${
                      continentCodes[team.continent] ||
                      "Playoff"
                    }
                  </td>
                </tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    `;

    worldCupGroups.appendChild(card);
  });
}


/* =========================================================
   RESET FUNCTIONS
========================================================= */

function resetContinent(continentId) {
  const continentName = continentNames[continentId];

  const confirmed = confirm(
    `Reset all ${continentName} groups, teams and results?`
  );

  if (!confirmed) {
    return;
  }

  const continentTeamIds =
    state.continents[continentId].groups.flatMap(group =>
      group.teams.map(team => team.id)
    );

  state.qualifiedTeams = state.qualifiedTeams.filter(
    team =>
      team.automatic ||
      !continentTeamIds.includes(team.id)
  );

  state.continents[continentId].groups = [];
  state.finalDraw = {};

  saveState();
  renderEverything();
}

function resetAllQualifiers() {
  const confirmed = confirm(
    "Reset every qualifying group, team, result, playoff and final draw?"
  );

  if (!confirmed) {
    return;
  }

  state = createDefaultState();

  saveState();
  renderEverything();
}


/* =========================================================
   BUTTON AND INPUT EVENTS
========================================================= */

function initialiseStaticButtons() {
  document
    .querySelectorAll(".add-group-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        addGroup(button.dataset.continent);
      });
    });

  document
    .querySelectorAll(".add-team-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        addTeam(button.dataset.continent);
      });
    });

  document
    .querySelectorAll(".reset-continent-btn")
    .forEach(button => {
      button.addEventListener("click", () => {
        resetContinent(button.dataset.continent);
      });
    });

  addPlayoffBtn?.addEventListener(
    "click",
    addPlayoffMatch
  );

  drawWorldCupBtn?.addEventListener(
    "click",
    drawWorldCupGroups
  );

  clearWorldCupDrawBtn?.addEventListener(
    "click",
    clearWorldCupDraw
  );

  resetAllBtn?.addEventListener(
    "click",
    resetAllQualifiers
  );

  qualifiedContinentFilter?.addEventListener(
    "change",
    renderQualifiedTeams
  );
}

document.addEventListener("click", event => {
  const actionElement = event.target.closest(
    "[data-action]"
  );

  if (!actionElement) {
    return;
  }

  const action = actionElement.dataset.action;

  if (action === "add-group") {
    addGroup(actionElement.dataset.continent);
  }

  if (action === "add-team") {
    addTeam(
      actionElement.dataset.continent,
      actionElement.dataset.group || null
    );
  }

  if (action === "rename-group") {
    renameGroup(
      actionElement.dataset.continent,
      actionElement.dataset.group
    );
  }

  if (action === "remove-group") {
    removeGroup(
      actionElement.dataset.continent,
      actionElement.dataset.group
    );
  }

  if (action === "remove-team") {
    removeTeam(
      actionElement.dataset.continent,
      actionElement.dataset.group,
      actionElement.dataset.team
    );
  }

  if (action === "move-team") {
    moveTeam(
      actionElement.dataset.continent,
      actionElement.dataset.group,
      actionElement.dataset.team
    );
  }

  if (action === "toggle-qualified") {
    toggleQualification(actionElement.dataset.team);
  }

  if (action === "remove-qualified") {
    removeQualifiedTeam(actionElement.dataset.team);
  }

  if (action === "remove-playoff") {
    removePlayoffMatch(actionElement.dataset.match);
  }

  if (action === "qualify-playoff") {
    qualifyPlayoffWinner(actionElement.dataset.match);
  }
});

document.addEventListener("change", event => {
  const element = event.target;
  const action = element.dataset.action;

  if (action === "group-score") {
    updateGroupScore(
      element.dataset.continent,
      element.dataset.group,
      element.dataset.fixture,
      element.dataset.side,
      element.value
    );
  }

  if (action === "playoff-input") {
    updatePlayoffMatch(
      element.dataset.match,
      element.dataset.field,
      element.value
    );
  }
});


/* =========================================================
   MAIN RENDER
========================================================= */

function renderEverything() {
  ensureAutomaticQualifiers();

  Object.keys(state.continents).forEach(
    renderContinentGroups
  );

  renderContinentStatistics();
  renderSummary();
  renderQualifiedTeams();
  renderPlayoffs();
  renderWorldCupDraw();
}


/* =========================================================
   AUTHENTICATION
========================================================= */

onAuthStateChanged(auth, async user => {
  currentUser = user;
  firebaseReady = true;

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userStatus = document.getElementById("userStatus");

  if (user) {
    if (loginBtn) {
      loginBtn.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
    }

    if (userStatus) {
      userStatus.textContent =
        `Signed in as ${user.email}`;
    }

    await loadFromFirebase();
  } else {
    if (loginBtn) {
      loginBtn.style.display = "inline-block";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    if (userStatus) {
      userStatus.textContent = "Not signed in";
    }
  }

  renderEverything();
});


/* =========================================================
   INITIALISATION
========================================================= */

createHeaderControls();
initialiseContinentNavigation();
initialiseStaticButtons();
ensureAutomaticQualifiers();
renderEverything();