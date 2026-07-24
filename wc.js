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
    id: "automatic-morocco",
    name: "Morocco",
    continent: "caf",
    status: "Host Nation"
  },
  {
    id: "automatic-portugal",
    name: "Portugal",
    continent: "uefa",
    status: "Host Nation"
  },
  {
    id: "automatic-spain",
    name: "Spain",
    continent: "uefa",
    status: "Host Nation"
  },
  {
    id: "automatic-argentina",
    name: "Argentina",
    continent: "conmebol",
    status: "Centenary Host"
  },
  {
    id: "automatic-paraguay",
    name: "Paraguay",
    continent: "conmebol",
    status: "Centenary Host"
  },
  {
    id: "automatic-uruguay",
    name: "Uruguay",
    continent: "conmebol",
    status: "Centenary Host"
  }
];

/* =========================================================
   PRESET QUALIFYING GROUPS
========================================================= */

const presetQualifyingGroups = {
  uefa: [
    [
      "France",
      "Slovakia",
      "Bulgaria",
      "Kazakhstan",
      "San Marino"
    ],
    [
      "England",
      "Greece",
      "Israel",
      "Latvia",
      "Liechtenstein"
    ],
    [
      "Belgium",
      "Scotland",
      "Finland",
      "Moldova",
      "Gibraltar"
    ],
    [
      "Netherlands",
      "Romania",
      "Bosnia and Herzegovina",
      "Faroe Islands",
      "Andorra"
    ],
    [
      "Germany",
      "Russia",
      "Iceland",
      "Cyprus",
      "Malta"
    ],
    [
      "Croatia",
      "Czech Republic",
      "Georgia",
      "Estonia"
    ],
    [
      "Italy",
      "Hungary",
      "Republic of Ireland",
      "Azerbaijan"
    ],
    [
      "Switzerland",
      "Wales",
      "Albania",
      "Armenia"
    ],
    [
      "Denmark",
      "Sweden",
      "North Macedonia",
      "Belarus"
    ],
    [
      "Austria",
      "Poland",
      "Slovenia",
      "Kosovo"
    ],
    [
      "Norway",
      "Serbia",
      "Northern Ireland",
      "Lithuania"
    ],
    [
      "Ukraine",
      "Turkey",
      "Montenegro",
      "Luxembourg"
    ]
  ],

  caf: [
    [
      "Senegal",
      "Burkina Faso",
      "Zambia",
      "Mozambique",
      "Burundi",
      "Seychelles"
    ],
    [
      "Egypt",
      "Cape Verde",
      "Uganda",
      "Libya",
      "Botswana",
      "Somalia"
    ],
    [
      "Algeria",
      "Ghana",
      "Gabon",
      "Malawi",
      "Liberia",
      "Eritrea"
    ],
    [
      "Ivory Coast",
      "Guinea",
      "Angola",
      "Togo",
      "Mauritius"
    ],
    [
      "Nigeria",
      "Equatorial Guinea",
      "Benin",
      "Tanzania",
      "Chad"
    ],
    [
      "Tunisia",
      "South Africa",
      "Mauritania",
      "Zimbabwe",
      "Djibouti"
    ],
    [
      "Cameroon",
      "DR Congo",
      "Kenya",
      "Gambia",
      "São Tomé and Príncipe"
    ],
    [
      "Mali",
      "Guinea-Bissau",
      "Namibia",
      "Rwanda",
      "South Sudan"
    ],
    [
      "Sudan",
      "Congo",
      "Madagascar",
      "Sierra Leone",
      "Eswatini"
    ],
    [
      "Niger",
      "Ethiopia",
      "Comoros",
      "Central African Republic",
      "Lesotho"
    ]
  ],

  afc: [
    [
      "Japan",
      "Kuwait",
      "North Korea",
      "Hong Kong",
      "Bangladesh",
      "Guam"
    ],
    [
      "Iran",
      "Jordan",
      "Thailand",
      "Singapore",
      "Bhutan"
    ],
    [
      "South Korea",
      "Oman",
      "Vietnam",
      "Yemen",
      "Brunei"
    ],
    [
      "Australia",
      "Bahrain",
      "Lebanon",
      "Afghanistan",
      "Laos"
    ],
    [
      "Qatar",
      "China PR",
      "Indonesia",
      "Myanmar",
      "Mongolia"
    ],
    [
      "Saudi Arabia",
      "Syria",
      "Malaysia",
      "Chinese Taipei",
      "Pakistan"
    ],
    [
      "Iraq",
      "Palestine",
      "Philippines",
      "Maldives",
      "Sri Lanka"
    ],
    [
      "Uzbekistan",
      "Kyrgyzstan",
      "India",
      "Nepal",
      "Macau"
    ],
    [
      "United Arab Emirates",
      "Tajikistan",
      "Turkmenistan",
      "Cambodia",
      "Timor-Leste"
    ]
  ],

  concacaf: [
    [
      "Mexico",
      "Honduras",
      "Guatemala",
      "Barbados",
      "Anguilla"
    ],
    [
      "Canada",
      "Jamaica",
      "Nicaragua",
      "Antigua and Barbuda",
      "US Virgin Islands"
    ],
    [
      "United States",
      "Haiti",
      "Cuba",
      "Saint Kitts and Nevis",
      "Turks and Caicos Islands"
    ],
    [
      "Panama",
      "Trinidad and Tobago",
      "Bermuda",
      "Belize",
      "British Virgin Islands"
    ],
    [
      "Costa Rica",
      "El Salvador",
      "Guyana",
      "Dominica",
      "Bahamas"
    ],
    [
      "Curaçao",
      "Suriname",
      "Dominican Republic",
      "Saint Lucia",
      "Cayman Islands"
    ],
    [
      "Grenada",
      "Puerto Rico",
      "Aruba",
      "Saint Vincent and the Grenadines",
      "Montserrat"
    ]
  ],

  conmebol: [
    [
      "Brazil",
      "Colombia",
      "Ecuador",
      "Venezuela",
      "Peru",
      "Chile",
      "Bolivia"
    ]
  ],

  ofc: [
    [
      "New Zealand",
      "Solomon Islands",
      "Fiji",
      "Papua New Guinea",
      "Cook Islands",
      "Tonga"
    ],
    [
      "New Caledonia",
      "Tahiti",
      "Vanuatu",
      "Samoa",
      "American Samoa"
    ]
  ]
};


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
  "Central African Republic": "central-african-republic",
  "São Tomé and Príncipe": "sao-tome-and-principe",
  "US Virgin Islands": "us-virgin-islands",
  "British Virgin Islands": "british-virgin-islands",
  "Turks and Caicos Islands": "turks-and-caicos-islands",
  "Saint Kitts and Nevis": "saint-kitts-and-nevis",
  "Saint Vincent and the Grenadines":
    "saint-vincent-and-the-grenadines",
  "New Caledonia": "new-caledonia",
  "Cook Islands": "cook-islands",
  "American Samoa": "american-samoa",
  "Timor-Leste": "timor-leste",
  "China PR": "china",
  "Chinese Taipei": "chinese-taipei",
  "Hong Kong": "hong-kong",
  "Curaçao": "curacao"
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

function createPresetGroups(continentId) {
  const presetGroups =
    presetQualifyingGroups[continentId] || [];

  return presetGroups.map((teamNames, groupIndex) => ({
    id: `preset-${continentId}-${groupIndex + 1}`,
    name:
      continentId === "conmebol"
        ? "South American League"
        : `Group ${getGroupLetter(groupIndex)}`,
    teams: teamNames.map((name, teamIndex) => ({
      id:
        `preset-${continentId}-` +
        `${groupIndex + 1}-${teamIndex + 1}`,
      name
    })),
    results: {}
  }));
}

function createPresetContinents() {
  return {
    uefa: {
      groups: createPresetGroups("uefa")
    },
    caf: {
      groups: createPresetGroups("caf")
    },
    afc: {
      groups: createPresetGroups("afc")
    },
    concacaf: {
      groups: createPresetGroups("concacaf")
    },
    conmebol: {
      groups: createPresetGroups("conmebol")
    },
    ofc: {
      groups: createPresetGroups("ofc")
    }
  };
}

function hasAnyQualifyingGroups(candidateState) {
  return Object.values(
    candidateState?.continents || {}
  ).some(
    continent =>
      Array.isArray(continent?.groups) &&
      continent.groups.length > 0
  );
}

function createDefaultState() {
  return {
    continents: createPresetContinents(),

    playoffMatches: [],

    qualifiedTeams: automaticQualifiers.map(team => ({
      ...team,
      automatic: true
    })),

    finalDraw: {},
    finalGroupResults: {},

    knockoutRounds: {
      roundOf32: [],
      roundOf16: [],
      quarterFinals: [],
      semiFinals: [],
      final: []
    },

    worldCupWinner: null
  };
}

let state = loadLocalState();
/* =========================================================
   DOM ELEMENTS
========================================================= */

const qualifiedCount =
  document.getElementById("qualifiedCount");

const remainingPlaces =
  document.getElementById("remainingPlaces");

const qualifiedList =
  document.getElementById("qualifiedList");

const qualifiedContinentFilter =
  document.getElementById(
    "qualifiedContinentFilter"
  );

const playoffGrid =
  document.getElementById("playoffGrid");

const worldCupGroups =
  document.getElementById("worldCupGroups");

const drawWorldCupBtn =
  document.getElementById("drawWorldCupBtn");

const clearWorldCupDrawBtn =
  document.getElementById(
    "clearWorldCupDrawBtn"
  );

const addPlayoffBtn =
  document.getElementById("addPlayoffBtn");

const resetAllBtn =
  document.getElementById("resetAllBtn");


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
  return teamName
    .trim()
    .replace(/\s+/g, " ");
}

function teamAlreadyExists(teamName) {
  const normalised =
    teamName.toLowerCase();

  if (
    automaticQualifiers.some(
      team =>
        team.name.toLowerCase() === normalised
    )
  ) {
    return true;
  }

  return Object.values(
    state.continents
  ).some(continent =>
    continent.groups.some(group =>
      group.teams.some(
        team =>
          team.name.toLowerCase() ===
          normalised
      )
    )
  );
}

function getAllContinentalTeams() {
  const teams = [];

  Object.entries(
    state.continents
  ).forEach(
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
  for (
    const [continentId, continent]
    of Object.entries(state.continents)
  ) {
    for (const group of continent.groups) {
      const team = group.teams.find(
        item => item.id === teamId
      );

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

function findGroup(
  continentId,
  groupId
) {
  return state
    .continents[continentId]
    ?.groups.find(
      group => group.id === groupId
    );
}


/* =========================================================
   TEAM SWAPPING
========================================================= */

let selectedSwapTeam = null;

function swapTeams(
  continentId,
  teamId
) {
  const selectedTeam =
    findTeam(teamId);

  if (
    !selectedTeam ||
    selectedTeam.continentId !==
      continentId
  ) {
    return;
  }

  if (!selectedSwapTeam) {
    selectedSwapTeam = {
      continentId,
      teamId
    };

    renderEverything();
    return;
  }

  if (
    selectedSwapTeam.teamId === teamId
  ) {
    selectedSwapTeam = null;
    renderEverything();
    return;
  }

  if (
    selectedSwapTeam.continentId !==
    continentId
  ) {
    alert(
      "Teams can only be swapped within the same confederation."
    );

    selectedSwapTeam = null;
    renderEverything();
    return;
  }

  const first =
    findTeam(
      selectedSwapTeam.teamId
    );

  const second =
    findTeam(teamId);

  if (!first || !second) {
    selectedSwapTeam = null;
    renderEverything();
    return;
  }

  const firstIndex =
    first.group.teams.findIndex(
      team =>
        team.id === first.team.id
    );

  const secondIndex =
    second.group.teams.findIndex(
      team =>
        team.id === second.team.id
    );

  if (
    firstIndex === -1 ||
    secondIndex === -1
  ) {
    selectedSwapTeam = null;
    renderEverything();
    return;
  }

  first.group.teams[firstIndex] =
    second.team;

  second.group.teams[secondIndex] =
    first.team;

  first.group.results = {};
  second.group.results = {};

  selectedSwapTeam = null;
  state.finalDraw = {};

  saveState();
  renderEverything();
}


/* =========================================================
   LOCAL STORAGE
========================================================= */

function loadLocalState() {
  try {
    const savedState =
      localStorage.getItem(
        "worldCup2030QualifierState"
      );

    if (!savedState) {
      return createDefaultState();
    }

    const parsedState =
      JSON.parse(savedState);

    const defaultState =
      createDefaultState();

    if (
      !hasAnyQualifyingGroups(
        parsedState
      )
    ) {
      return defaultState;
    }

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

      playoffMatches:
        parsedState.playoffMatches || [],

    finalDraw:
  parsedState.finalDraw || {},

finalGroupResults:
  parsedState.finalGroupResults || {},

knockoutRounds:
  parsedState.knockoutRounds || {
    roundOf32: [],
    roundOf16: [],
    quarterFinals: [],
    semiFinals: [],
    final: []
  },

worldCupWinner:
  parsedState.worldCupWinner || null
    };
  } catch (error) {
    console.error(
      "Unable to load local data:",
      error
    );

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
  if (
    !currentUser ||
    !firebaseReady
  ) {
    return;
  }

  try {
    await setDoc(
      doc(
        db,
        "worldCup2030Qualifiers",
        currentUser.uid
      ),
      {
        state,
        updatedAt:
          new Date().toISOString()
      },
      {
        merge: true
      }
    );
  } catch (error) {
    console.error(
      "Unable to save qualifying data:",
      error
    );
  }
}

async function loadFromFirebase() {
  if (!currentUser) {
    return;
  }

  try {
    const snapshot =
      await getDoc(
        doc(
          db,
          "worldCup2030Qualifiers",
          currentUser.uid
        )
      );

    if (!snapshot.exists()) {
      await saveToFirebase();
      return;
    }

    const data =
      snapshot.data();

    if (data.state) {
      state =
        hasAnyQualifyingGroups(
          data.state
        )
          ? data.state
          : createDefaultState();

      ensureAutomaticQualifiers();
      saveLocalState();
    }
  } catch (error) {
    console.error(
      "Unable to load qualifying data:",
      error
    );
  }
}

function ensureAutomaticQualifiers() {
  if (
    !Array.isArray(
      state.qualifiedTeams
    )
  ) {
    state.qualifiedTeams = [];
  }

  automaticQualifiers.forEach(host => {
    const existingTeam =
      state.qualifiedTeams.find(
        team =>
          team.name.toLowerCase() ===
          host.name.toLowerCase()
      );

    if (existingTeam) {
      existingTeam.id = host.id;
      existingTeam.name = host.name;
      existingTeam.continent =
        host.continent;
      existingTeam.status =
        host.status;
      existingTeam.automatic = true;
    } else {
      state.qualifiedTeams.push({
        ...host,
        automatic: true
      });
    }
  });
}

function repairFinalDrawTeamIds() {
  Object.entries(
    state.finalDraw || {}
  ).forEach(
    ([groupLetter, teams]) => {
      teams.forEach(
        (team, teamIndex) => {
          if (team.id) {
            return;
          }

          const automaticTeam =
            automaticQualifiers.find(
              host =>
                host.name.toLowerCase() ===
                team.name.toLowerCase()
            );

          team.id =
            automaticTeam?.id ||
            `final-${groupLetter}-${teamIndex}-${createFlagSlug(
              team.name
            )}`;
        }
      );
    }
  );
}


/* =========================================================
   HEADER CONTROLS
========================================================= */

function createHeaderControls() {
  const header =
    document.querySelector(
      ".app-header"
    );

  if (
    !header ||
    document.querySelector(
      ".header-controls"
    )
  ) {
    return;
  }

  const controls =
    document.createElement("div");

  controls.className =
    "header-controls";

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

    <p
      id="userStatus"
      class="user-status"
    >
      Not signed in
    </p>
  `;

  header.appendChild(controls);

  document
    .getElementById("loginBtn")
    ?.addEventListener(
      "click",
      async () => {
        try {
          await signInWithPopup(
            auth,
            provider
          );
        } catch (error) {
          console.error(
            "Sign-in failed:",
            error
          );

          alert(
            "Google sign-in was unsuccessful."
          );
        }
      }
    );

  document
    .getElementById("logoutBtn")
    ?.addEventListener(
      "click",
      async () => {
        try {
          await signOut(auth);
        } catch (error) {
          console.error(
            "Sign-out failed:",
            error
          );
        }
      }
    );
}


/* =========================================================
   CONTINENT NAVIGATION
========================================================= */

function initialiseContinentNavigation() {
  const buttons =
    document.querySelectorAll(
      ".continent-btn"
    );

  const panels =
    document.querySelectorAll(
      ".continent-panel"
    );

  buttons.forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const selectedContinent =
          button.dataset.continent;

        buttons.forEach(item => {
          item.classList.toggle(
            "active",
            item === button
          );
        });

        panels.forEach(panel => {
          panel.classList.toggle(
            "active",
            panel.dataset
              .continentPanel ===
              selectedContinent
          );
        });
      }
    );
  });
}
/* =========================================================
   GROUP CREATION
========================================================= */

function addGroup(continentId) {
  const continent =
    state.continents[continentId];

  if (!continent) {
    return;
  }

  const defaultName =
    continentId === "conmebol" &&
    continent.groups.length === 0
      ? "South American League"
      : `Group ${getGroupLetter(
          continent.groups.length
        )}`;

  const enteredName = prompt(
    "Enter a name for this group or league:",
    defaultName
  );

  if (enteredName === null) {
    return;
  }

  const groupName =
    enteredName.trim() || defaultName;

  continent.groups.push({
    id: generateId("group"),
    name: groupName,
    teams: [],
    results: {}
  });

  saveState();
  renderEverything();
}

function removeGroup(
  continentId,
  groupId
) {
  const group =
    findGroup(
      continentId,
      groupId
    );

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
    removeQualifiedTeam(
      team.id,
      false
    );
  });

  state
    .continents[continentId]
    .groups =
    state
      .continents[continentId]
      .groups.filter(
        item => item.id !== groupId
      );

  selectedSwapTeam = null;
  state.finalDraw = {};

  saveState();
  renderEverything();
}

function renameGroup(
  continentId,
  groupId
) {
  const group =
    findGroup(
      continentId,
      groupId
    );

  if (!group) {
    return;
  }

  const newName = prompt(
    "Rename this group:",
    group.name
  );

  if (
    newName === null ||
    !newName.trim()
  ) {
    return;
  }

  group.name = newName.trim();

  saveState();
  renderEverything();
}


/* =========================================================
   TEAM CREATION
========================================================= */

function selectGroupForTeam(
  continentId
) {
  const continent =
    state.continents[continentId];

  if (
    !continent ||
    continent.groups.length === 0
  ) {
    alert(
      "Create a group before adding a team."
    );

    return null;
  }

  if (
    continent.groups.length === 1
  ) {
    return continent.groups[0];
  }

  const groupOptions =
    continent.groups
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

  const selectedIndex =
    Number(selection) - 1;

  if (
    !Number.isInteger(
      selectedIndex
    ) ||
    selectedIndex < 0 ||
    selectedIndex >=
      continent.groups.length
  ) {
    alert(
      "That group selection was not valid."
    );

    return null;
  }

  return continent.groups[
    selectedIndex
  ];
}

function addTeam(
  continentId,
  chosenGroupId = null
) {
  const continent =
    state.continents[continentId];

  if (!continent) {
    return;
  }

  let group = null;

  if (chosenGroupId) {
    group = findGroup(
      continentId,
      chosenGroupId
    );
  } else {
    group =
      selectGroupForTeam(
        continentId
      );
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

  const teamName =
    normaliseTeamName(
      enteredName
    );

  if (!teamName) {
    return;
  }

  if (
    teamAlreadyExists(teamName)
  ) {
    alert(
      `${teamName} has already been added.`
    );

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

function removeTeam(
  continentId,
  groupId,
  teamId
) {
  const group =
    findGroup(
      continentId,
      groupId
    );

  if (!group) {
    return;
  }

  const team =
    group.teams.find(
      item => item.id === teamId
    );

  if (!team) {
    return;
  }

  const confirmed = confirm(
    `Remove ${team.name} from ${group.name}?`
  );

  if (!confirmed) {
    return;
  }

  group.teams =
    group.teams.filter(
      item => item.id !== teamId
    );

  group.results = {};

  removeQualifiedTeam(
    teamId,
    false
  );

  if (
    selectedSwapTeam?.teamId ===
    teamId
  ) {
    selectedSwapTeam = null;
  }

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function moveTeam(
  continentId,
  groupId,
  teamId
) {
  const currentGroup =
    findGroup(
      continentId,
      groupId
    );

  const continent =
    state.continents[continentId];

  if (
    !currentGroup ||
    continent.groups.length < 2
  ) {
    alert(
      "Create another group before moving this team."
    );

    return;
  }

  const team =
    currentGroup.teams.find(
      item => item.id === teamId
    );

  if (!team) {
    return;
  }

  const otherGroups =
    continent.groups.filter(
      group => group.id !== groupId
    );

  const options =
    otherGroups
      .map(
        (group, index) =>
          `${index + 1}. ${group.name}`
      )
      .join("\n");

  const selection = prompt(
    `Move ${team.name} to which group?\n\n${options}`,
    "1"
  );

  if (selection === null) {
    return;
  }

  const selectedIndex =
    Number(selection) - 1;

  const newGroup =
    otherGroups[selectedIndex];

  if (!newGroup) {
    alert(
      "That group selection was not valid."
    );

    return;
  }

  currentGroup.teams =
    currentGroup.teams.filter(
      item => item.id !== teamId
    );

  currentGroup.results = {};

  newGroup.teams.push(team);
  newGroup.results = {};

  selectedSwapTeam = null;
  state.finalDraw = {};

  saveState();
  renderEverything();
}


/* =========================================================
   FIXTURES
========================================================= */

function createGroupFixtures(
  group
) {
  const fixtures = [];

  for (
    let firstIndex = 0;
    firstIndex <
      group.teams.length;
    firstIndex++
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
        group.teams.length;
      secondIndex++
    ) {
      fixtures.push({
        id:
          `${group.teams[firstIndex].id}-` +
          `${group.teams[secondIndex].id}`,
        home:
          group.teams[firstIndex],
        away:
          group.teams[secondIndex]
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
  const group =
    findGroup(
      continentId,
      groupId
    );

  if (!group) {
    return;
  }

  if (!group.results) {
    group.results = {};
  }

  if (
    !group.results[fixtureId]
  ) {
    group.results[fixtureId] = {
      home: "",
      away: ""
    };
  }

  group
    .results[fixtureId][side] =
    value === ""
      ? ""
      : Math.max(
          0,
          Number(value)
        );

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

function sortTableTeams(
  teamA,
  teamB
) {
  return (
    teamB.points -
      teamA.points ||
    teamB.gd -
      teamA.gd ||
    teamB.gf -
      teamA.gf ||
    teamA.name.localeCompare(
      teamB.name
    )
  );
}

function calculateGroupTable(
  group
) {
  const table = {};

  group.teams.forEach(team => {
    table[team.id] =
      createBlankStats(team);
  });

  const fixtures =
    createGroupFixtures(group);

  fixtures.forEach(fixture => {
    const result =
      group.results?.[
        fixture.id
      ];

    if (
      !result ||
      result.home === "" ||
      result.away === "" ||
      result.home ===
        undefined ||
      result.away ===
        undefined
    ) {
      return;
    }

    const homeGoals =
      Number(result.home);

    const awayGoals =
      Number(result.away);

    const homeStats =
      table[fixture.home.id];

    const awayStats =
      table[fixture.away.id];

    if (
      !homeStats ||
      !awayStats
    ) {
      return;
    }

    homeStats.played += 1;
    awayStats.played += 1;

    homeStats.gf += homeGoals;
    homeStats.ga += awayGoals;

    awayStats.gf += awayGoals;
    awayStats.ga += homeGoals;

    if (
      homeGoals > awayGoals
    ) {
      homeStats.won += 1;
      homeStats.points += 3;
      awayStats.lost += 1;
    } else if (
      awayGoals > homeGoals
    ) {
      awayStats.won += 1;
      awayStats.points += 3;
      homeStats.lost += 1;
    } else {
      homeStats.drawn += 1;
      awayStats.drawn += 1;

      homeStats.points += 1;
      awayStats.points += 1;
    }

    homeStats.gd =
      homeStats.gf -
      homeStats.ga;

    awayStats.gd =
      awayStats.gf -
      awayStats.ga;
  });

  return Object
    .values(table)
    .sort(sortTableTeams);
}


/* =========================================================
   QUALIFICATION
========================================================= */

function isTeamQualified(
  teamId
) {
  return state
    .qualifiedTeams
    .some(
      team => team.id === teamId
    );
}

function qualifyTeam(teamId) {
  if (
    state.qualifiedTeams.length >=
    TOURNAMENT_SIZE
  ) {
    alert(
      "All 64 tournament places have already been filled."
    );

    return;
  }

  const found =
    findTeam(teamId);

  if (
    !found ||
    isTeamQualified(teamId)
  ) {
    return;
  }

  state.qualifiedTeams.push({
    id: found.team.id,
    name: found.team.name,
    continent:
      found.continentId,
    status:
      `${found.group.name} qualifier`,
    automatic: false
  });

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function removeQualifiedTeam(
  teamId,
  shouldRender = true
) {
  state.qualifiedTeams =
    state.qualifiedTeams.filter(
      team =>
        team.automatic ||
        team.id !== teamId
    );

  state.finalDraw = {};

  if (shouldRender) {
    saveState();
    renderEverything();
  }
}

function toggleQualification(
  teamId
) {
  if (
    isTeamQualified(teamId)
  ) {
    removeQualifiedTeam(teamId);
  } else {
    qualifyTeam(teamId);
  }
}
/* =========================================================
   GROUP RENDERING
========================================================= */

function renderContinentGroups(
  continentId
) {
  const container =
    document.getElementById(
      `${continentId}Groups`
    );

  if (!container) {
    return;
  }

  const continent =
    state.continents[continentId];

  container.innerHTML = "";

  if (
    !continent ||
    continent.groups.length === 0
  ) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">
          ⚽
        </span>

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

  continent.groups.forEach(
    group => {
      const table =
        calculateGroupTable(group);

      const fixtures =
        createGroupFixtures(group);

      const groupCard =
        document.createElement(
          "article"
        );

      groupCard.className =
        "group-table";

      groupCard.innerHTML = `
        <div class="group-heading">
          <h3>
            ${escapeHTML(group.name)}
          </h3>

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
                <p>
                  No teams have been added to this group.
                </p>
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
                      .map(
                        (
                          team,
                          index
                        ) => {
                          const qualified =
                            isTeamQualified(
                              team.id
                            );

                          const selectedForSwap =
                            selectedSwapTeam
                              ?.teamId ===
                            team.id;

                          const rowClasses = [
                            qualified
                              ? "qualifies-directly"
                              : "",
                            selectedForSwap
                              ? "swap-selected"
                              : ""
                          ]
                            .filter(Boolean)
                            .join(" ");

                          return `
                            <tr
                              class="${rowClasses}"
                            >
                              <td>
                                ${index + 1}
                              </td>

                              <td>
                                ${teamWithFlag(
                                  team.name
                                )}
                              </td>

                              <td>
                                ${team.played}
                              </td>

                              <td>
                                ${team.won}
                              </td>

                              <td>
                                ${team.drawn}
                              </td>

                              <td>
                                ${team.lost}
                              </td>

                              <td>
                                ${team.gf}
                              </td>

                              <td>
                                ${team.ga}
                              </td>

                              <td>
                                ${team.gd}
                              </td>

                              <td>
                                <strong>
                                  ${team.points}
                                </strong>
                              </td>

                              <td>
                                ${
                                  qualified
                                    ? `
                                      <span class="badge">
                                        Qualified
                                      </span>
                                    `
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
                                  data-action="swap-team"
                                  data-continent="${continentId}"
                                  data-team="${team.id}"
                                >
                                  ${
                                    selectedForSwap
                                      ? "Cancel Swap"
                                      : "Swap"
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
                        }
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>

              <div class="position-key">
                <span class="key-item">
                  <span
                    class="key-colour key-direct"
                  ></span>

                  Qualified for World Cup
                </span>

                <span class="key-item">
                  <span
                    class="key-colour key-swap"
                  ></span>

                  Selected for swapping
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
                  <p class="eyebrow">
                    Group Matches
                  </p>

                  <h3>Fixtures</h3>
                </div>
              </div>

              <div class="fixtures-list">
                ${fixtures
                  .map(fixture => {
                    const result =
                      group.results?.[
                        fixture.id
                      ] || {};

                    return `
                      <div class="fixture">
                        <div class="fixture-group">
                          ${escapeHTML(
                            group.name
                          )}
                        </div>

                        <div class="home">
                          ${teamWithFlag(
                            fixture.home.name
                          )}
                        </div>

                        <input
                          type="number"
                          min="0"
                          class="score-input"
                          value="${
                            result.home ?? ""
                          }"
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
                          value="${
                            result.away ?? ""
                          }"
                          data-action="group-score"
                          data-continent="${continentId}"
                          data-group="${group.id}"
                          data-fixture="${fixture.id}"
                          data-side="away"
                        >

                        <div class="away">
                          ${teamWithFlag(
                            fixture.away.name
                          )}
                        </div>
                      </div>
                    `;
                  })
                  .join("")}
              </div>
            `
        }
      `;

      container.appendChild(
        groupCard
      );
    }
  );
}


/* =========================================================
   CONTINENT STATISTICS
========================================================= */

function renderContinentStatistics() {
  Object.entries(
    state.continents
  ).forEach(
    (
      [
        continentId,
        continent
      ]
    ) => {
      const groupCountElement =
        document.getElementById(
          `${continentId}GroupCount`
        );

      const teamCountElement =
        document.getElementById(
          `${continentId}TeamCount`
        );

      const qualifiedCountElement =
        document.getElementById(
          `${continentId}QualifiedCount`
        );

      const teamCount =
        continent.groups.reduce(
          (
            total,
            group
          ) =>
            total +
            group.teams.length,
          0
        );

      const continentQualifiedCount =
        state.qualifiedTeams.filter(
          team =>
            team.continent ===
            continentId
        ).length;

      if (groupCountElement) {
        groupCountElement.textContent =
          continent.groups.length;
      }

      if (teamCountElement) {
        teamCountElement.textContent =
          teamCount;
      }

      if (
        qualifiedCountElement
      ) {
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
    qualifiedContinentFilter
      ?.value || "all";

  const teams =
    state.qualifiedTeams.filter(
      team =>
        selectedContinent ===
          "all" ||
        team.continent ===
          selectedContinent
    );

  qualifiedList.innerHTML = "";

  if (teams.length === 0) {
    qualifiedList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">
          🏳️
        </span>

        <p>
          No qualified teams match this filter.
        </p>
      </div>
    `;

    return;
  }

  teams
    .sort(
      (
        teamA,
        teamB
      ) =>
        teamA.name.localeCompare(
          teamB.name
        )
    )
    .forEach(team => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        `qualified-card ${
          team.automatic
            ? "host-qualified"
            : ""
        }`;

      card.innerHTML = `
        <span class="badge">
          ${escapeHTML(
            team.status
          )}
        </span>

        <h3>
          ${teamWithFlag(
            team.name
          )}
        </h3>

        <span
          class="confederation-badge"
        >
          ${
            continentCodes[
              team.continent
            ] || "Playoff"
          }
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

      qualifiedList.appendChild(
        card
      );
    });
}


/* =========================================================
   SUMMARY COUNTS
========================================================= */

function renderSummary() {
  const totalQualified =
    state.qualifiedTeams.length;

  const placesRemaining =
    Math.max(
      0,
      TOURNAMENT_SIZE -
        totalQualified
    );

  if (qualifiedCount) {
    qualifiedCount.textContent =
      totalQualified;
  }

  if (remainingPlaces) {
    remainingPlaces.textContent =
      placesRemaining;
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

function removePlayoffMatch(
  matchId
) {
  const match =
    state.playoffMatches.find(
      item =>
        item.id === matchId
    );

  if (match?.winner) {
    const qualifiedWinner =
      state.qualifiedTeams.find(
        team =>
          !team.automatic &&
          team.status ===
            "Intercontinental Playoff Winner" &&
          team.name ===
            match.winner
      );

    if (qualifiedWinner) {
      removeQualifiedTeam(
        qualifiedWinner.id,
        false
      );
    }
  }

  state.playoffMatches =
    state.playoffMatches.filter(
      match =>
        match.id !== matchId
    );

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function updatePlayoffMatch(
  matchId,
  field,
  value
) {
  const match =
    state.playoffMatches.find(
      item =>
        item.id === matchId
    );

  if (!match) {
    return;
  }

  if (
    field === "homeScore" ||
    field === "awayScore"
  ) {
    match[field] =
      value === ""
        ? ""
        : Math.max(
            0,
            Number(value)
          );
  } else {
    match[field] = value;
  }

  if (match.winner) {
    match.winner = "";
  }

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function qualifyPlayoffWinner(
  matchId
) {
  const match =
    state.playoffMatches.find(
      item =>
        item.id === matchId
    );

  if (!match) {
    return;
  }

  const homeTeam =
    normaliseTeamName(
      match.homeTeam
    );

  const awayTeam =
    normaliseTeamName(
      match.awayTeam
    );

  if (
    !homeTeam ||
    !awayTeam
  ) {
    alert(
      "Enter both playoff countries first."
    );

    return;
  }

  if (
    homeTeam.toLowerCase() ===
    awayTeam.toLowerCase()
  ) {
    alert(
      "The two playoff countries must be different."
    );

    return;
  }

  if (
    match.homeScore === "" ||
    match.awayScore === ""
  ) {
    alert(
      "Enter both playoff scores first."
    );

    return;
  }

  const homeScore =
    Number(match.homeScore);

  const awayScore =
    Number(match.awayScore);

  if (
    !Number.isFinite(
      homeScore
    ) ||
    !Number.isFinite(
      awayScore
    )
  ) {
    alert(
      "Enter valid playoff scores."
    );

    return;
  }

  if (
    homeScore === awayScore
  ) {
    alert(
      "The playoff cannot finish level. Enter a winning score."
    );

    return;
  }

  const winner =
    homeScore > awayScore
      ? homeTeam
      : awayTeam;

  const existingTeam =
    state.qualifiedTeams.some(
      team =>
        team.name.toLowerCase() ===
        winner.toLowerCase()
    );

  if (existingTeam) {
    alert(
      `${winner} is already qualified.`
    );

    return;
  }

  if (
    state.qualifiedTeams.length >=
    TOURNAMENT_SIZE
  ) {
    alert(
      "All 64 tournament places are already filled."
    );

    return;
  }

  const winnerId =
    generateId(
      "playoff-winner"
    );

  state.qualifiedTeams.push({
    id: winnerId,
    name: winner,
    continent: "playoff",
    status:
      "Intercontinental Playoff Winner",
    automatic: false
  });

  match.winner = winner;
  match.winnerId = winnerId;

  state.finalDraw = {};

  saveState();
  renderEverything();
}

function renderPlayoffs() {
  if (!playoffGrid) {
    return;
  }

  playoffGrid.innerHTML = "";

  if (
    state.playoffMatches.length ===
    0
  ) {
    playoffGrid.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">
          🏟️
        </span>

        <p>
          No intercontinental playoff matches have been created.
        </p>
      </div>
    `;

    return;
  }

  state.playoffMatches.forEach(
    (
      match,
      index
    ) => {
      const card =
        document.createElement(
          "article"
        );

      card.className =
        "playoff-card";

      card.innerHTML = `
        <div class="section-header">
          <h3>
            Playoff ${index + 1}
          </h3>

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
            value="${escapeHTML(
              match.homeTeam
            )}"
            data-action="playoff-input"
            data-match="${match.id}"
            data-field="homeTeam"
          >

          <input
            type="number"
            min="0"
            class="playoff-score"
            value="${
              match.homeScore
            }"
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
            value="${escapeHTML(
              match.awayTeam
            )}"
            data-action="playoff-input"
            data-match="${match.id}"
            data-field="awayTeam"
          >

          <input
            type="number"
            min="0"
            class="playoff-score"
            value="${
              match.awayScore
            }"
            data-action="playoff-input"
            data-match="${match.id}"
            data-field="awayScore"
          >
        </div>

        ${
          match.winner
            ? `
              <span class="badge">
                ${escapeHTML(
                  match.winner
                )} qualified
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

      playoffGrid.appendChild(
        card
      );
    }
  );
}
/* =========================================================
   64-TEAM WORLD CUP TOURNAMENT
========================================================= */

let selectedFinalSwapTeam = null;

const knockoutRoundOrder = [
  "roundOf32",
  "roundOf16",
  "quarterFinals",
  "semiFinals",
  "final"
];

const knockoutRoundNames = {
  roundOf32: "Round of 32",
  roundOf16: "Round of 16",
  quarterFinals: "Quarter-finals",
  semiFinals: "Semi-finals",
  final: "World Cup Final"
};

function ensureWorldCupTournamentState() {
  if (!state.finalGroupResults) {
    state.finalGroupResults = {};
  }

  if (!state.knockoutRounds) {
    state.knockoutRounds = {};
  }

  knockoutRoundOrder.forEach(roundKey => {
    if (!Array.isArray(state.knockoutRounds[roundKey])) {
      state.knockoutRounds[roundKey] = [];
    }
  });

  if (state.worldCupWinner === undefined) {
    state.worldCupWinner = null;
  }
}

function clearWorldCupProgress() {
  ensureWorldCupTournamentState();

  state.knockoutRounds = {
    roundOf32: [],
    roundOf16: [],
    quarterFinals: [],
    semiFinals: [],
    final: []
  };

  state.worldCupWinner = null;
}

function shuffleArray(items) {
  const shuffled = [...items];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index--
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1)
    );

    [
      shuffled[index],
      shuffled[randomIndex]
    ] = [
      shuffled[randomIndex],
      shuffled[index]
    ];
  }

  return shuffled;
}

function drawWorldCupGroups() {
  if (
    state.qualifiedTeams.length !==
    TOURNAMENT_SIZE
  ) {
    alert(
      `You need exactly 64 qualified teams. You currently have ${state.qualifiedTeams.length}.`
    );

    return;
  }

  const shuffledTeams =
    shuffleArray(state.qualifiedTeams);

  const newDraw = {};

  for (
    let groupIndex = 0;
    groupIndex < FINAL_GROUP_COUNT;
    groupIndex++
  ) {
    const groupLetter =
      getGroupLetter(groupIndex);

    const startIndex =
      groupIndex * TEAMS_PER_FINAL_GROUP;

    newDraw[groupLetter] =
      shuffledTeams.slice(
        startIndex,
        startIndex + TEAMS_PER_FINAL_GROUP
      );
  }

  state.finalDraw = newDraw;
  state.finalGroupResults = {};
  selectedFinalSwapTeam = null;

  clearWorldCupProgress();

  saveState();
  renderEverything();
}

function clearWorldCupDraw() {
  if (
    Object.keys(
      state.finalDraw || {}
    ).length === 0
  ) {
    return;
  }

  const confirmed = confirm(
    "Clear the current World Cup draw, group results and knockout bracket?"
  );

  if (!confirmed) {
    return;
  }

  state.finalDraw = {};
  state.finalGroupResults = {};
  selectedFinalSwapTeam = null;

  clearWorldCupProgress();

  saveState();
  renderEverything();
}

function getFinalGroup(groupLetter) {
  const teams =
    state.finalDraw?.[groupLetter] || [];

  return {
    id: `world-cup-group-${groupLetter}`,
    name: `Group ${groupLetter}`,
    teams,
    results:
      state.finalGroupResults?.[groupLetter] || {}
  };
}

function findFinalDrawTeam(
  groupLetter,
  teamId
) {
  const teams =
    state.finalDraw?.[groupLetter] || [];

  const teamIndex =
    teams.findIndex(
      team => team.id === teamId
    );

  if (teamIndex === -1) {
    return null;
  }

  return {
    groupLetter,
    teamIndex,
    team: teams[teamIndex]
  };
}

function swapFinalDrawTeams(
  groupLetter,
  teamId
) {
  const selected =
    findFinalDrawTeam(
      groupLetter,
      teamId
    );

  if (!selected) {
    return;
  }

  if (!selectedFinalSwapTeam) {
    selectedFinalSwapTeam = {
      groupLetter,
      teamId
    };

    renderWorldCupDraw();
    return;
  }

  if (
    selectedFinalSwapTeam.groupLetter ===
      groupLetter &&
    selectedFinalSwapTeam.teamId === teamId
  ) {
    selectedFinalSwapTeam = null;
    renderWorldCupDraw();
    return;
  }

  const first =
    findFinalDrawTeam(
      selectedFinalSwapTeam.groupLetter,
      selectedFinalSwapTeam.teamId
    );

  const second = selected;

  if (!first || !second) {
    selectedFinalSwapTeam = null;
    return;
  }

  state.finalDraw[
    first.groupLetter
  ][first.teamIndex] = second.team;

  state.finalDraw[
    second.groupLetter
  ][second.teamIndex] = first.team;

  state.finalGroupResults[
    first.groupLetter
  ] = {};

  state.finalGroupResults[
    second.groupLetter
  ] = {};

  selectedFinalSwapTeam = null;

  clearWorldCupProgress();

  saveState();
  renderEverything();
}

function updateFinalGroupScore(
  groupLetter,
  fixtureId,
  side,
  value
) {
  ensureWorldCupTournamentState();

  if (
    !state.finalGroupResults[groupLetter]
  ) {
    state.finalGroupResults[groupLetter] = {};
  }

  if (
    !state.finalGroupResults[
      groupLetter
    ][fixtureId]
  ) {
    state.finalGroupResults[
      groupLetter
    ][fixtureId] = {
      home: "",
      away: ""
    };
  }

  state.finalGroupResults[
    groupLetter
  ][fixtureId][side] =
    value === ""
      ? ""
      : Math.max(0, Number(value));

  clearWorldCupProgress();

  saveState();
  renderEverything();
}

function isFinalGroupComplete(
  groupLetter
) {
  const group =
    getFinalGroup(groupLetter);

  const fixtures =
    createGroupFixtures(group);

  return (
    group.teams.length ===
      TEAMS_PER_FINAL_GROUP &&
    fixtures.length === 6 &&
    fixtures.every(fixture => {
      const result =
        group.results?.[fixture.id];

      return (
        result &&
        result.home !== "" &&
        result.away !== "" &&
        result.home !== undefined &&
        result.away !== undefined
      );
    })
  );
}

function allFinalGroupsComplete() {
  const groupLetters =
    Object.keys(
      state.finalDraw || {}
    );

  return (
    groupLetters.length ===
      FINAL_GROUP_COUNT &&
    groupLetters.every(
      isFinalGroupComplete
    )
  );
}

function createKnockoutMatch(
  id,
  homeTeam,
  awayTeam
) {
  return {
    id,
    homeTeam,
    awayTeam,
    homeScore: "",
    awayScore: "",
    homePenalties: "",
    awayPenalties: "",
    winnerId: null
  };
}

function buildRoundOf32() {
  if (!allFinalGroupsComplete()) {
    alert(
      "Enter all six scores in every World Cup group before creating the Round of 32."
    );

    return;
  }

  const standings = {};

  Object.keys(state.finalDraw)
    .sort()
    .forEach(groupLetter => {
      standings[groupLetter] =
        calculateGroupTable(
          getFinalGroup(groupLetter)
        );
    });

  const matches = [];

  for (
    let groupIndex = 0;
    groupIndex < FINAL_GROUP_COUNT;
    groupIndex += 2
  ) {
    const firstLetter =
      getGroupLetter(groupIndex);

    const secondLetter =
      getGroupLetter(groupIndex + 1);

    matches.push(
      createKnockoutMatch(
        `roundOf32-${matches.length + 1}`,
        standings[firstLetter][0],
        standings[secondLetter][1]
      )
    );

    matches.push(
      createKnockoutMatch(
        `roundOf32-${matches.length + 1}`,
        standings[secondLetter][0],
        standings[firstLetter][1]
      )
    );
  }

  clearWorldCupProgress();

  state.knockoutRounds.roundOf32 =
    matches;

  saveState();
  renderEverything();
}

function getKnockoutWinner(match) {
  if (
    match.homeScore === "" ||
    match.awayScore === "" ||
    match.homeScore === undefined ||
    match.awayScore === undefined
  ) {
    return null;
  }

  const homeScore =
    Number(match.homeScore);

  const awayScore =
    Number(match.awayScore);

  if (homeScore > awayScore) {
    return match.homeTeam;
  }

  if (awayScore > homeScore) {
    return match.awayTeam;
  }

  if (
    match.homePenalties === "" ||
    match.awayPenalties === "" ||
    match.homePenalties === undefined ||
    match.awayPenalties === undefined
  ) {
    return null;
  }

  const homePenalties =
    Number(match.homePenalties);

  const awayPenalties =
    Number(match.awayPenalties);

  if (
    homePenalties > awayPenalties
  ) {
    return match.homeTeam;
  }

  if (
    awayPenalties > homePenalties
  ) {
    return match.awayTeam;
  }

  return null;
}

function preserveMatchResult(
  newMatch,
  oldMatches
) {
  const oldMatch =
    oldMatches.find(match =>
      match.homeTeam?.id ===
        newMatch.homeTeam?.id &&
      match.awayTeam?.id ===
        newMatch.awayTeam?.id
    );

  if (!oldMatch) {
    return newMatch;
  }

  return {
    ...newMatch,
    homeScore: oldMatch.homeScore,
    awayScore: oldMatch.awayScore,
    homePenalties:
      oldMatch.homePenalties,
    awayPenalties:
      oldMatch.awayPenalties,
    winnerId: oldMatch.winnerId
  };
}

function rebuildLaterKnockoutRounds(
  changedRoundKey
) {
  const changedIndex =
    knockoutRoundOrder.indexOf(
      changedRoundKey
    );

  for (
    let roundIndex = changedIndex + 1;
    roundIndex <
      knockoutRoundOrder.length;
    roundIndex++
  ) {
    const previousRoundKey =
      knockoutRoundOrder[
        roundIndex - 1
      ];

    const currentRoundKey =
      knockoutRoundOrder[
        roundIndex
      ];

    const previousMatches =
      state.knockoutRounds[
        previousRoundKey
      ];

    const oldCurrentMatches =
      state.knockoutRounds[
        currentRoundKey
      ] || [];

    const winners =
      previousMatches.map(
        getKnockoutWinner
      );

    if (
      previousMatches.length === 0 ||
      winners.some(winner => !winner)
    ) {
      state.knockoutRounds[
        currentRoundKey
      ] = [];

      for (
        let laterIndex =
          roundIndex + 1;
        laterIndex <
          knockoutRoundOrder.length;
        laterIndex++
      ) {
        state.knockoutRounds[
          knockoutRoundOrder[
            laterIndex
          ]
        ] = [];
      }

      state.worldCupWinner = null;
      return;
    }

    const newMatches = [];

    for (
      let winnerIndex = 0;
      winnerIndex < winners.length;
      winnerIndex += 2
    ) {
      const newMatch =
        createKnockoutMatch(
          `${currentRoundKey}-${newMatches.length + 1}`,
          winners[winnerIndex],
          winners[winnerIndex + 1]
        );

      newMatches.push(
        preserveMatchResult(
          newMatch,
          oldCurrentMatches
        )
      );
    }

    state.knockoutRounds[
      currentRoundKey
    ] = newMatches;
  }

  const finalMatch =
    state.knockoutRounds.final[0];

  const champion =
    finalMatch
      ? getKnockoutWinner(finalMatch)
      : null;

  state.worldCupWinner =
    champion || null;
}

function updateKnockoutMatch(
  roundKey,
  matchId,
  field,
  value
) {
  ensureWorldCupTournamentState();

  const match =
    state.knockoutRounds[
      roundKey
    ]?.find(
      item => item.id === matchId
    );

  if (!match) {
    return;
  }

  match[field] =
    value === ""
      ? ""
      : Math.max(0, Number(value));

  const winner =
    getKnockoutWinner(match);

  match.winnerId =
    winner?.id || null;

  rebuildLaterKnockoutRounds(
    roundKey
  );

  saveState();
  renderEverything();
}

function resetKnockoutBracket() {
  if (
    state.knockoutRounds
      ?.roundOf32?.length === 0
  ) {
    return;
  }

  const confirmed = confirm(
    "Clear every knockout score and return to the completed group stage?"
  );

  if (!confirmed) {
    return;
  }

  clearWorldCupProgress();

  saveState();
  renderEverything();
}

function ensureTournamentStageContainer() {
  let container =
    document.getElementById(
      "worldCupTournamentStage"
    );

  if (
    !container &&
    worldCupGroups?.parentElement
  ) {
    container =
      document.createElement(
        "section"
      );

    container.id =
      "worldCupTournamentStage";

    container.className =
      "tournament-stage";

    worldCupGroups
      .parentElement
      .appendChild(container);
  }

  return container;
}

function renderFinalGroupCard(
  groupLetter
) {
  const group =
    getFinalGroup(groupLetter);

  const table =
    calculateGroupTable(group);

  const fixtures =
    createGroupFixtures(group);

  const complete =
    isFinalGroupComplete(
      groupLetter
    );

  return `
    <article class="group-table">
      <div class="group-heading">
        <div>
          <h3>Group ${groupLetter}</h3>

          <span class="badge">
            ${
              complete
                ? "Complete"
                : "Enter all scores"
            }
          </span>
        </div>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Country</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
              <th>Draw</th>
            </tr>
          </thead>

          <tbody>
            ${table.map(
              (team, index) => {
                const selected =
                  selectedFinalSwapTeam
                    ?.groupLetter ===
                      groupLetter &&
                  selectedFinalSwapTeam
                    ?.teamId ===
                      team.id;

                return `
                  <tr class="${
                    index < 2
                      ? "qualifies-directly"
                      : ""
                  } ${
                    selected
                      ? "swap-selected"
                      : ""
                  }">
                    <td>${index + 1}</td>

                    <td>
                      ${teamWithFlag(
                        team.name
                      )}
                    </td>

                    <td>${team.played}</td>
                    <td>${team.won}</td>
                    <td>${team.drawn}</td>
                    <td>${team.lost}</td>
                    <td>${team.gf}</td>
                    <td>${team.ga}</td>
                    <td>${team.gd}</td>

                    <td>
                      <strong>
                        ${team.points}
                      </strong>
                    </td>

                    <td>
                      <button
                        type="button"
                        class="secondary-btn"
                        data-action="final-swap-team"
                        data-group="${groupLetter}"
                        data-team="${team.id}"
                      >
                        ${
                          selected
                            ? "Cancel"
                            : "Swap"
                        }
                      </button>
                    </td>
                  </tr>
                `;
              }
            ).join("")}
          </tbody>
        </table>
      </div>

      <div class="section-header">
        <div>
          <p class="eyebrow">
            Group matches
          </p>

          <h3>
            Your score predictions
          </h3>
        </div>
      </div>

      <div class="fixtures-list">
        ${fixtures.map(fixture => {
          const result =
            group.results?.[
              fixture.id
            ] || {};

          return `
            <div class="fixture">
              <div class="home">
                ${teamWithFlag(
                  fixture.home.name
                )}
              </div>

              <input
                type="number"
                min="0"
                class="score-input"
                value="${
                  result.home ?? ""
                }"
                data-action="final-group-score"
                data-group="${groupLetter}"
                data-fixture="${fixture.id}"
                data-side="home"
              >

              <span>-</span>

              <input
                type="number"
                min="0"
                class="score-input"
                value="${
                  result.away ?? ""
                }"
                data-action="final-group-score"
                data-group="${groupLetter}"
                data-fixture="${fixture.id}"
                data-side="away"
              >

              <div class="away">
                ${teamWithFlag(
                  fixture.away.name
                )}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderKnockoutMatch(
  roundKey,
  match
) {
  const isDraw =
    match.homeScore !== "" &&
    match.awayScore !== "" &&
    Number(match.homeScore) ===
      Number(match.awayScore);

  const winner =
    getKnockoutWinner(match);

  return `
    <article class="playoff-card">
      <div class="fixture-group">
        ${
          winner
            ? `${escapeHTML(
                winner.name
              )} advances`
            : "Enter your prediction"
        }
      </div>

      <div class="fixture">
        <div class="home">
          ${teamWithFlag(
            match.homeTeam.name
          )}
        </div>

        <input
          type="number"
          min="0"
          class="score-input"
          value="${
            match.homeScore ?? ""
          }"
          data-action="knockout-score"
          data-round="${roundKey}"
          data-match="${match.id}"
          data-field="homeScore"
        >

        <span>-</span>

        <input
          type="number"
          min="0"
          class="score-input"
          value="${
            match.awayScore ?? ""
          }"
          data-action="knockout-score"
          data-round="${roundKey}"
          data-match="${match.id}"
          data-field="awayScore"
        >

        <div class="away">
          ${teamWithFlag(
            match.awayTeam.name
          )}
        </div>
      </div>

      ${
        isDraw
          ? `
            <div class="fixture">
              <div class="home">
                Penalties
              </div>

              <input
                type="number"
                min="0"
                class="score-input"
                value="${
                  match.homePenalties ??
                  ""
                }"
                data-action="knockout-score"
                data-round="${roundKey}"
                data-match="${match.id}"
                data-field="homePenalties"
              >

              <span>-</span>

              <input
                type="number"
                min="0"
                class="score-input"
                value="${
                  match.awayPenalties ??
                  ""
                }"
                data-action="knockout-score"
                data-round="${roundKey}"
                data-match="${match.id}"
                data-field="awayPenalties"
              >

              <div class="away">
                Penalty shootout
              </div>
            </div>
          `
          : ""
      }
    </article>
  `;
}

function renderWorldCupKnockoutStage() {
  const container =
    ensureTournamentStageContainer();

  if (!container) {
    return;
  }

  ensureWorldCupTournamentState();

  if (
    Object.keys(
      state.finalDraw || {}
    ).length === 0
  ) {
    container.innerHTML = "";
    return;
  }

  const hasRoundOf32 =
    state.knockoutRounds
      .roundOf32.length > 0;

  container.innerHTML = `
    <div class="section-header">
      <div>
        <p class="eyebrow">
          Knockout stage
        </p>

        <h2>
          Road to the World Cup Final
        </h2>

        <p>
          The top two teams from each group qualify. Enter each result and the winner will progress automatically.
        </p>
      </div>

      <div class="stage-actions">
        ${
          !hasRoundOf32
            ? `
              <button
                type="button"
                class="primary-btn"
                data-action="build-round-of-32"
                ${
                  allFinalGroupsComplete()
                    ? ""
                    : "disabled"
                }
              >
                Create Round of 32
              </button>
            `
            : `
              <button
                type="button"
                class="danger-btn"
                data-action="reset-knockout"
              >
                Reset Knockout Stage
              </button>
            `
        }
      </div>
    </div>

    ${
      state.worldCupWinner
        ? `
          <article
            class="qualified-card host-qualified"
            style="text-align:center; margin-bottom:1.5rem;"
          >
            <p class="eyebrow">
              World Cup Champions
            </p>

            <h2>
              🏆
              ${teamWithFlag(
                state.worldCupWinner.name
              )}
            </h2>
          </article>
        `
        : ""
    }

    ${
      !hasRoundOf32
        ? `
          <div class="empty-state">
            <span class="empty-state-icon">
              🏆
            </span>

            <p>
              ${
                allFinalGroupsComplete()
                  ? "All groups are complete. Create the Round of 32 when you are happy with the tables."
                  : "Complete all 16 group tables to unlock the knockout stage."
              }
            </p>
          </div>
        `
        : knockoutRoundOrder
            .map(roundKey => {
              const matches =
                state.knockoutRounds[
                  roundKey
                ];

              if (!matches.length) {
                return "";
              }

              return `
                <section class="tournament-round">
                  <div class="section-header">
                    <div>
                      <p class="eyebrow">
                        World Cup
                      </p>

                      <h2>
                        ${
                          knockoutRoundNames[
                            roundKey
                          ]
                        }
                      </h2>
                    </div>
                  </div>

                  <div class="playoff-grid">
                    ${matches.map(
                      match =>
                        renderKnockoutMatch(
                          roundKey,
                          match
                        )
                    ).join("")}
                  </div>
                </section>
              `;
            })
            .join("")
    }
  `;
}

function renderWorldCupDraw() {
  if (!worldCupGroups) {
    return;
  }

  ensureWorldCupTournamentState();

  worldCupGroups.innerHTML = "";

  const groups =
    Object.keys(
      state.finalDraw || {}
    ).sort();

  if (groups.length === 0) {
    const message =
      state.qualifiedTeams.length ===
        TOURNAMENT_SIZE
        ? "All 64 teams are ready. Press Draw 16 Groups."
        : `The draw becomes available when 64 teams have qualified. ${state.qualifiedTeams.length} of 64 places are currently filled.`;

    worldCupGroups.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">
          🎲
        </span>

        <p>${message}</p>
      </div>
    `;

    renderWorldCupKnockoutStage();
    return;
  }

  worldCupGroups.innerHTML = `
    <div
      class="section-header"
      style="grid-column:1 / -1;"
    >
      <div>
        <p class="eyebrow">
          Final tournament
        </p>

        <h2>
          Your World Cup predictions
        </h2>

        <p>
          Swap any two countries, enter all group scores, then continue through every knockout round.
        </p>
      </div>
    </div>

    ${groups.map(
      renderFinalGroupCard
    ).join("")}
  `;

  renderWorldCupKnockoutStage();
}


/* =========================================================
   RESET FUNCTIONS
========================================================= */

function resetContinent(
  continentId
) {
  const continentName =
    continentNames[
      continentId
    ];

  const confirmed = confirm(
    `Reset ${continentName} to its original preset groups?`
  );

  if (!confirmed) {
    return;
  }

  const continentTeamIds =
    state
      .continents[
        continentId
      ]
      .groups
      .flatMap(group =>
        group.teams.map(
          team => team.id
        )
      );

  state.qualifiedTeams =
    state.qualifiedTeams.filter(
      team =>
        team.automatic ||
        !continentTeamIds.includes(
          team.id
        )
    );

  state
    .continents[
      continentId
    ]
    .groups =
    createPresetGroups(
      continentId
    );

  selectedSwapTeam = null;
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

  state =
    createDefaultState();

  selectedSwapTeam = null;

  saveState();
  renderEverything();
}


/* =========================================================
   BUTTON AND INPUT EVENTS
========================================================= */

function initialiseStaticButtons() {
  document
    .querySelectorAll(
      ".add-group-btn"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          addGroup(
            button.dataset.continent
          );
        }
      );
    });

  document
    .querySelectorAll(
      ".add-team-btn"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          addTeam(
            button.dataset.continent
          );
        }
      );
    });

  document
    .querySelectorAll(
      ".reset-continent-btn"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          resetContinent(
            button.dataset.continent
          );
        }
      );
    });

  addPlayoffBtn
    ?.addEventListener(
      "click",
      addPlayoffMatch
    );

  drawWorldCupBtn
    ?.addEventListener(
      "click",
      drawWorldCupGroups
    );

  clearWorldCupDrawBtn
    ?.addEventListener(
      "click",
      clearWorldCupDraw
    );

  resetAllBtn
    ?.addEventListener(
      "click",
      resetAllQualifiers
    );

  qualifiedContinentFilter
    ?.addEventListener(
      "change",
      renderQualifiedTeams
    );
}

document.addEventListener(
  "click",
  event => {
    const actionElement =
      event.target.closest(
        "[data-action]"
      );

    if (!actionElement) {
      return;
    }

    const action =
      actionElement
        .dataset.action;

    if (
      action === "add-group"
    ) {
      addGroup(
        actionElement
          .dataset.continent
      );
    }

    if (
      action === "add-team"
    ) {
      addTeam(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.group ||
          null
      );
    }

    if (
      action ===
      "rename-group"
    ) {
      renameGroup(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.group
      );
    }

    if (
      action ===
      "remove-group"
    ) {
      removeGroup(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.group
      );
    }

    if (
      action ===
      "remove-team"
    ) {
      removeTeam(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.group,
        actionElement
          .dataset.team
      );
    }

    if (
      action === "move-team"
    ) {
      moveTeam(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.group,
        actionElement
          .dataset.team
      );
    }

    if (
      action === "swap-team"
    ) {
      swapTeams(
        actionElement
          .dataset.continent,
        actionElement
          .dataset.team
      );
    }

    if (
      action ===
      "toggle-qualified"
    ) {
      toggleQualification(
        actionElement
          .dataset.team
      );
    }

    if (
      action ===
      "remove-qualified"
    ) {
      removeQualifiedTeam(
        actionElement
          .dataset.team
      );
    }

    if (
      action ===
      "remove-playoff"
    ) {
      removePlayoffMatch(
        actionElement
          .dataset.match
      );
    }

    if (
      action ===
      "qualify-playoff"
    ) {
      qualifyPlayoffWinner(
        actionElement
          .dataset.match
      );
    }
    if (
  action ===
  "final-swap-team"
) {
  swapFinalDrawTeams(
    actionElement.dataset.group,
    actionElement.dataset.team
  );
}

if (
  action ===
  "build-round-of-32"
) {
  buildRoundOf32();
}

if (
  action ===
  "reset-knockout"
) {
  resetKnockoutBracket();
}
  }
);

document.addEventListener(
  "change",
  event => {
    const element =
      event.target;

    const action =
      element.dataset.action;

    if (
      action ===
      "group-score"
    ) {
      updateGroupScore(
        element
          .dataset.continent,
        element
          .dataset.group,
        element
          .dataset.fixture,
        element
          .dataset.side,
        element.value
      );
    }
    if (
  action ===
  "final-group-score"
) {
  updateFinalGroupScore(
    element.dataset.group,
    element.dataset.fixture,
    element.dataset.side,
    element.value
  );
}

if (
  action ===
  "knockout-score"
) {
  updateKnockoutMatch(
    element.dataset.round,
    element.dataset.match,
    element.dataset.field,
    element.value
  );
}

    if (
      action ===
      "playoff-input"
    ) {
      updatePlayoffMatch(
        element
          .dataset.match,
        element
          .dataset.field,
        element.value
      );
    }
  }
);


/* =========================================================
   MAIN RENDER
========================================================= */

function renderEverything() {
  ensureAutomaticQualifiers();
  repairFinalDrawTeamIds();
  ensureWorldCupTournamentState();

  Object.keys(
    state.continents
  ).forEach(
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

onAuthStateChanged(
  auth,
  async user => {
    currentUser = user;
    firebaseReady = true;

    const loginBtn =
      document.getElementById(
        "loginBtn"
      );

    const logoutBtn =
      document.getElementById(
        "logoutBtn"
      );

    const userStatus =
      document.getElementById(
        "userStatus"
      );

    if (user) {
      if (loginBtn) {
        loginBtn.style.display =
          "none";
      }

      if (logoutBtn) {
        logoutBtn.style.display =
          "inline-block";
      }

      if (userStatus) {
        userStatus.textContent =
          `Signed in as ${user.email}`;
      }

      await loadFromFirebase();
    } else {
      if (loginBtn) {
        loginBtn.style.display =
          "inline-block";
      }

      if (logoutBtn) {
        logoutBtn.style.display =
          "none";
      }

      if (userStatus) {
        userStatus.textContent =
          "Not signed in";
      }
    }

    renderEverything();
  }
);


/* =========================================================
   INITIALISATION
========================================================= */

createHeaderControls();
initialiseContinentNavigation();
initialiseStaticButtons();
ensureAutomaticQualifiers();
renderEverything();