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

/* =========================
   FIREBASE SETUP
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyCfiE1Qf3z_fwd6E9mppHWqg_H8H8qeKUM",
  authDomain: "footballpredictor-28368.firebaseapp.com",
  projectId: "footballpredictor-28368",
  storageBucket: "footballpredictor-28368.firebasestorage.app",
  messagingSenderId: "52688713927",
  appId: "1:52688713927:web:451c9ac16b516fdaba66e2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let firebaseReady = false;

const WORLD_CUP_PAGE = "wc.html";

/* =========================
   LEAGUE DATA
========================= */

const leagues = {
  premierLeague: {
    name: "Premier League",
    teams: [
      "Arsenal", "Aston Villa", "Bournemouth", "Brentford", "Brighton",
      "Chelsea", "Coventry City", "Crystal Palace", "Everton", "Fulham",
      "Hull City", "Ipswich Town", "Leeds United", "Liverpool", "Manchester City",
      "Manchester United",  "Newcastle United",
      "Nottingham Forest", "Sunderland", "Tottenham Hotspur"
    ]
  },

  championship: {
    name: "Championship",
    teams: [
      "Birmingham City", "Blackburn Rovers", "Bolton Wanderers", "Bristol City",
      "Burnley", "Cardiff City", "Charlton Athletic", "Derby County",
       "Lincoln City", "Middlesbrough", "Millwall", "Norwich City",
      "Portsmouth", "Preston North End", "QPR", "Sheffield United",
      "Southampton", "Stoke City", "Swansea City", "Watford",
      "West Bromwich Albion", "West Ham United", "Wolves", "Wrexham"
    ]
  },

  leagueOne: {
    name: "League One",
    teams: [
      "AFC Wimbledon", "Barnsley", "Blackpool", "Bradford City",
      "Bromley", "Burton Albion", "Cambridge United", "Doncaster Rovers",
      "Huddersfield Town", "Leicester City", "Leyton Orient", "Luton Town",
      "Mansfield Town", "MK Dons", "Oxford United", "Peterborough United",
      "Plymouth Argyle", "Reading", "Salford City", "Sheffield Wednesday",
      "Stevenage", "Stockport County", "Wigan Athletic", "Wycombe Wanderers"
    ]
  },

  leagueTwo: {
    name: "League Two",
    teams: [
      "Accrington Stanley", "Barnet", "Bristol Rovers", "Cheltenham Town",
      "Chesterfield", "Colchester United", "Crawley Town", "Crewe Alexandra",
      "Exeter City", "Fleetwood Town", "Gillingham", "Grimsby Town",
      "Newport County", "Northampton Town", "Notts County", "Oldham Athletic",
      "Port Vale", "Rochdale", "Rotherham United", "Shrewsbury Town",
      "Swindon Town", "Tranmere Rovers", "Walsall", "York City"
    ]
  },

  conference: {
    name: "National League",
    teams: [
      "AFC Fylde", "Aldershot", "Altrincham", "Barrow", "Boreham Wood",
      "Boston United", "Carlisle United", "Eastleigh", "FC Halifax Town",
      "Forest Green Rovers", "Gateshead", "Harrogate Town",
      "Hartlepool United", "Hornchurch", "Kidderminster Harriers",
      "Scunthorpe United", "Solihull Moors", "Southend United",
      "Sutton United", "Tamworth", "Wealdstone", "Woking",
      "Worthing", "Yeovil Town"
    ]
  }
};

const clubColors = {
  "Arsenal": "#EF0107",
  "Aston Villa": "#670E36",
  "Bournemouth": "#DA291C",
  "Brentford": "#E30613",
  "Brighton": "#0057B8",
  "Chelsea": "#034694",
  "Coventry City": "#77BBE7",
  "Crystal Palace": "#1B458F",
  "Everton": "#003399",
  "Fulham": "#FFFFFF",
    "Hull City": "#F4A300",
  "Ipswich Town": "#005BAC",
  "Leeds United": "#FFCD00",
  "Liverpool": "#C8102E",
  "Manchester City": "#6CABDD",
  "Manchester United": "#DA291C",
  "Newcastle United": "#241F20",
  "Nottingham Forest": "#DD0000",
  "Sunderland": "#EB172B",
  "Tottenham Hotspur": "#132257",
  "West Ham United": "#7A263A",

  "Birmingham City": "#0033A0",
  "Blackburn Rovers": "#0057B8",
  "Bolton Wanderers": "#1B458F",
  "Bristol City": "#E21A23",
  "Burnley": "#6C1D45",
  "Cardiff City": "#0070B5",
  "Charlton Athletic": "#D71920",
  "Derby County": "#FFFFFF",
  "Lincoln City": "#E30613",
    "Middlesbrough": "#D71920",
  "Millwall": "#001489",
  "Norwich City": "#00A650",
  "Portsmouth": "#005BBB",
  "Preston North End": "#FFFFFF",
  "QPR": "#1D5DA8",
  "Sheffield United": "#EE2737",
  "Southampton": "#D71920",
  "Stoke City": "#E03A3E",
  "Swansea City": "#FFFFFF",
  "Watford": "#FBEE23",
  "West Bromwich Albion": "#122F67",
  "Wolves": "#FDB913",
  "Wrexham": "#D71920",

  "AFC Wimbledon": "#003087",
  "Barnsley": "#DA291C",
  "Blackpool": "#F68712",
  "Bradford City": "#FDB913",
  "Bromley": "#000000",
  "Burton Albion": "#FFD100",
  "Cambridge United": "#F6C800",
  "Doncaster Rovers": "#E30613",
  "Huddersfield Town": "#0072CE",
  "Leicester City": "#003090",
  "Leyton Orient": "#E30613",
  "Luton Town": "#F78F1E",
  "Mansfield Town": "#FDB913",
  "MK Dons": "#FFFFFF",
  "Oxford United": "#002147",
  "Peterborough United": "#005EB8",
  "Plymouth Argyle": "#004B3A",
  "Reading": "#005BAB",
  "Salford City": "#E30613",
  "Sheffield Wednesday": "#0057B8",
  "Stevenage": "#E30613",
  "Stockport County": "#1D428A",
  "Wigan Athletic": "#005BAC",
  "Wycombe Wanderers": "#002147",

  "Accrington Stanley": "#D71920",
  "Barnet": "#F58220",
  "Bristol Rovers": "#0057B8",
  "Cheltenham Town": "#E30613",
  "Chesterfield": "#0057B8",
  "Colchester United": "#005BAC",
  "Crawley Town": "#D71920",
  "Crewe Alexandra": "#D71920",
  "Exeter City": "#D71920",
  "Fleetwood Town": "#E30613",
  "Gillingham": "#005BAC",
  "Grimsby Town": "#000000",
  "Newport County": "#F58220",
  "Northampton Town": "#7A263A",
  "Notts County": "#000000",
  "Oldham Athletic": "#0057B8",
  "Port Vale": "#FFFFFF",
  "Rochdale": "#005BAC",
  "Rotherham United": "#E30613",
  "Shrewsbury Town": "#0057B8",
  "Swindon Town": "#E30613",
  "Tranmere Rovers": "#005BAC",
  "Walsall": "#E30613",
  "York City": "#D71920",

  "AFC Fylde": "#E30613",
  "Aldershot": "#E30613",
  "Altrincham": "#E30613",
  "Barrow": "#0057B8",
  "Boreham Wood": "#FFFFFF",
  "Boston United": "#FDB913",
  "Carlisle United": "#005BAC",
  "Eastleigh": "#0057B8",
  "FC Halifax Town": "#005BAC",
  "Forest Green Rovers": "#7AC142",
  "Gateshead": "#FFFFFF",
  "Harrogate Town": "#FDB913",
  "Hartlepool United": "#005BAC",
  "Hornchurch": "#E30613",
  "Kidderminster Harriers": "#E30613",
  "Scunthorpe United": "#7A263A",
  "Solihull Moors": "#FDB913",
  "Southend United": "#005BAC",
  "Sutton United": "#FDB913",
  "Tamworth": "#E30613",
  "Wealdstone": "#005BAC",
  "Woking": "#E30613",
  "Worthing": "#E30613",
  "Yeovil Town": "#006B3F"
};

const badgeOverrides = {
  "Birmingham City": "birmingham-badge.png",
  "Blackburn Rovers": "blackburn-badge.png",
  "Bristol City": "bristol-city-badge.png",
  "Bristol Rovers": "bristol-rovers-badge.png",
  "Cambridge United": "cambridge-badge.png",
  "Cardiff City": "cardiff-badge.png",
  "Cheltenham Town": "cheltenham-badge.png",
  "Colchester United": "colchester-badge.png",
  "Crewe Alexandra": "crewe-badge.png",
  "Crystal Palace": "crystal-palace-badge.png",
  "Derby County": "derby-badge.png",
  "Doncaster Rovers": "doncaster-badge.png",
  "FC Halifax Town": "halifax-badge.png",
  "Forest Green Rovers": "forest-green-badge.png",
  "Harrogate Town": "harrogate-badge.png",
  "Hartlepool United": "hartlepool-badge.png",
  "Huddersfield Town": "huddersfield-badge.png",
  "Ipswich Town": "ipswich-badge.png",
  "Leeds United": "leeds-badge.png",
  "Leicester City": "leicester-badge.png",
  "Leyton Orient": "leyton-orient-badge.png",
  "Lincoln City": "lincoln-badge.png",
  "Luton Town": "luton-badge.png",
  "Manchester City": "man-city-badge.png",
  "Manchester United": "man-united-badge.png",
  "Mansfield Town": "mansfield-badge.png",
  "MK Dons": "mk-dons-badge.png",
  "Newcastle United": "newcastle-badge.png",
  "Newport County": "newport-badge.png",
  "Northampton Town": "northampton-badge.png",
  "Nottingham Forest": "nottingham-forest-badge.png",
  "Oldham Athletic": "oldham-badge.png",
  "Peterborough United": "peterborough-badge.png",
  "Plymouth Argyle": "plymouth-badge.png",
  "Port Vale": "port-vale-badge.png",
  "Preston North End": "preston-badge.png",
  "QPR": "qpr-badge.png",
  "Rotherham United": "rotherham-badge.png",
  "Scunthorpe United": "scunthorpe-badge.png",
  "Sheffield United": "sheffield-united-badge.png",
  "Sheffield Wednesday": "sheffield-wednesday-badge.png",
  "Shrewsbury Town": "shrewsbury-badge.png",
  "Solihull Moors": "solihull-badge.png",
  "Southampton": "southampton-badge.png",
  "Southend United": "southend-badge.png",
  "Stoke City": "stoke-badge.png",
  "Swansea City": "swansea-badge.png",
  "Tranmere Rovers": "tranmere-badge.png",
  "West Bromwich Albion": "west-brom-badge.png",
  "Wigan Athletic": "wigan-badge.png",
  "Wycombe Wanderers": "wycombe-badge.png",
  "Yeovil Town": "yeovil-badge.png",
  "York City": "york-badge.png"
};

/* =========================
   APP STATE
========================= */

let currentLeague = "premierLeague";
let teams = leagues[currentLeague].teams;
let fixtures = [];
let table = [];

const tableBody = document.getElementById("leagueTableBody");
const fixturesList = document.getElementById("fixturesList");
const teamFilter = document.getElementById("teamFilter");
const resetBtn = document.getElementById("resetBtn");
const leagueSelect = document.getElementById("leagueSelect");

/* =========================
   HEADER BUTTONS
========================= */

function createHeaderControls() {
  const header = document.querySelector(".app-header");

  if (!header) return;

  const controls = document.createElement("div");
  controls.className = "header-controls";

  controls.innerHTML = `
    <a class="world-cup-btn" href="${WORLD_CUP_PAGE}">🏆 World Cup Predictor</a>
    <button id="loginBtn" class="login-btn">Sign in</button>
    <button id="logoutBtn" class="login-btn" style="display:none;">Sign out</button>
    <p id="userStatus" class="user-status">Not signed in</p>
  `;

  header.appendChild(controls);

  document.getElementById("loginBtn").addEventListener("click", () => {
    signInWithPopup(auth, provider);
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth);
  });
}

createHeaderControls();

/* =========================
   HELPERS
========================= */

function teamSlug(team) {
  return team
    .toLowerCase()
    .replaceAll("&", "and")
    .replaceAll("/", "-")
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll(" ", "-");
}

function getBadge(team) {
  const badgeFile = badgeOverrides[team] || `${teamSlug(team)}-badge.png`;
  return `assets/${badgeFile}`;
}

function getClubColor(team) {
  return clubColors[team] || "#00ff99";
}

function leagueStorageKey(league = currentLeague) {
  return `fixtures_${league}`;
}

function getAllLocalFixtures() {
  const data = {};

  Object.keys(leagues).forEach(leagueKey => {
    data[leagueKey] = JSON.parse(localStorage.getItem(leagueStorageKey(leagueKey))) || [];
  });

  return data;
}

/* =========================
   FIREBASE SAVE / LOAD
========================= */

async function saveToFirebase() {
  if (!currentUser || !firebaseReady) return;

  const fixturesByLeague = getAllLocalFixtures();
  fixturesByLeague[currentLeague] = fixtures;

  await setDoc(doc(db, "footballPredictors", currentUser.uid), {
    fixturesByLeague,
    currentLeague,
    updatedAt: new Date().toISOString()
  }, { merge: true });
}

async function loadFromFirebase() {
  if (!currentUser) return;

  const snap = await getDoc(doc(db, "footballPredictors", currentUser.uid));

  if (!snap.exists()) {
    await saveToFirebase();
    return;
  }

  const data = snap.data();
  const fixturesByLeague = data.fixturesByLeague || {};

  Object.entries(fixturesByLeague).forEach(([leagueKey, leagueFixtures]) => {
    localStorage.setItem(leagueStorageKey(leagueKey), JSON.stringify(leagueFixtures));
  });

  if (data.currentLeague && leagues[data.currentLeague]) {
    currentLeague = data.currentLeague;
    leagueSelect.value = currentLeague;
    teams = leagues[currentLeague].teams;
  }
}

/* =========================
   FIXTURES
========================= */

function loadFixtures() {
  fixtures = JSON.parse(localStorage.getItem(leagueStorageKey())) || [];

  if (fixtures.length === 0) {
    generateFixtures();
  }
}

function saveFixtures() {
  localStorage.setItem(leagueStorageKey(), JSON.stringify(fixtures));
  saveToFirebase();
}

function createEmptyTable() {
  table = teams.map(team => ({
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: team === "Southampton" ? -4 : 0
  }));
}

function generateFixtures() {
  fixtures = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams.length; j++) {
      if (i !== j) {
        fixtures.push({
          id: `${currentLeague}-${teamSlug(teams[i])}-vs-${teamSlug(teams[j])}`,
          homeTeam: teams[i],
          awayTeam: teams[j],
          homeGoals: "",
          awayGoals: "",
          played: false
        });
      }
    }
  }

  saveFixtures();
}

function collectVisibleFixtureInputs() {
  const fixtureCards = document.querySelectorAll(".fixture");

  fixtureCards.forEach(card => {
    const saveButton = card.querySelector(".save-btn");
    const homeInput = card.querySelector(".home-score");
    const awayInput = card.querySelector(".away-score");

    if (!saveButton || !homeInput || !awayInput) return;

    const fixtureId = saveButton.dataset.id;
    const fixture = fixtures.find(f => f.id === fixtureId);

    if (!fixture) return;

    fixture.homeGoals = homeInput.value;
    fixture.awayGoals = awayInput.value;
    fixture.played = homeInput.value !== "" && awayInput.value !== "";
  });

  saveFixtures();
}

/* =========================
   TABLE
========================= */

function calculateTable() {
  createEmptyTable();

  fixtures.forEach(fixture => {
    if (!fixture.played) return;

    const home = table.find(t => t.team === fixture.homeTeam);
    const away = table.find(t => t.team === fixture.awayTeam);

    if (!home || !away) return;

    const homeGoals = Number(fixture.homeGoals);
    const awayGoals = Number(fixture.awayGoals);

    home.played++;
    away.played++;

    home.goalsFor += homeGoals;
    home.goalsAgainst += awayGoals;

    away.goalsFor += awayGoals;
    away.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      home.won++;
      away.lost++;
      home.points += 3;
    } else if (homeGoals < awayGoals) {
      away.won++;
      home.lost++;
      away.points += 3;
    } else {
      home.drawn++;
      away.drawn++;
      home.points++;
      away.points++;
    }
  });

  table.forEach(team => {
    team.goalDifference = team.goalsFor - team.goalsAgainst;
  });

  table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });
}

function renderTable() {
  tableBody.innerHTML = "";

  table.forEach((team, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>
        <div class="table-team">
          <img
            src="${getBadge(team.team)}"
            alt="${team.team} badge"
            class="table-badge"
            onerror="this.style.display='none'"
          >
          <span>${team.team}</span>
        </div>
      </td>
      <td>${team.played}</td>
      <td>${team.won}</td>
      <td>${team.drawn}</td>
      <td>${team.lost}</td>
      <td>${team.goalsFor}</td>
      <td>${team.goalsAgainst}</td>
      <td>${team.goalDifference}</td>
      <td><strong>${team.points}</strong></td>
    `;

    tableBody.appendChild(row);
  });
}

/* =========================
   RENDERING
========================= */

function renderTeamFilter() {
  teamFilter.innerHTML = `<option value="all">All teams</option>`;

  teams.forEach(team => {
    const option = document.createElement("option");
    option.value = team;
    option.textContent = team;
    teamFilter.appendChild(option);
  });
}

function renderFixtures() {
  fixturesList.innerHTML = "";

  const selectedTeam = teamFilter.value;

  const visibleFixtures = fixtures.filter(fixture => {
    if (selectedTeam === "all") return true;
    return fixture.homeTeam === selectedTeam || fixture.awayTeam === selectedTeam;
  });

  visibleFixtures.forEach(fixture => {
    const fixtureCard = document.createElement("div");
    fixtureCard.className = "fixture enhanced-fixture";

    fixtureCard.style.setProperty("--home-color", getClubColor(fixture.homeTeam));
    fixtureCard.style.setProperty("--away-color", getClubColor(fixture.awayTeam));

    fixtureCard.innerHTML = `
      <div class="fixture-team-wrap home-wrap">
        <span class="fixture-team">${fixture.homeTeam}</span>
        <span class="club-colour-line home-line"></span>
      </div>

      <input
        type="number"
        min="0"
        class="score-input home-score"
        value="${fixture.homeGoals}"
        data-id="${fixture.id}"
        placeholder="H"
      />

      <input
        type="number"
        min="0"
        class="score-input away-score"
        value="${fixture.awayGoals}"
        data-id="${fixture.id}"
        placeholder="A"
      />

      <div class="fixture-team-wrap away-wrap">
        <span class="fixture-team away">${fixture.awayTeam}</span>
        <span class="club-colour-line away-line"></span>
      </div>

      <button class="save-btn" data-id="${fixture.id}">
        Save
      </button>
    `;

    fixturesList.appendChild(fixtureCard);
  });
}

function refreshApp() {
  calculateTable();
  renderTable();
  renderFixtures();
}

/* =========================
   ACTIONS
========================= */

function saveFixtureResult(fixtureId) {
  collectVisibleFixtureInputs();

  const fixture = fixtures.find(f => f.id === fixtureId);

  if (!fixture) return;

  if (fixture.homeGoals === "" || fixture.awayGoals === "") {
    alert("Please enter both scores.");
    return;
  }

  fixture.homeGoals = Number(fixture.homeGoals);
  fixture.awayGoals = Number(fixture.awayGoals);
  fixture.played = true;

  saveFixtures();
  calculateTable();
  renderTable();
  renderFixtures();
}

leagueSelect.addEventListener("change", () => {
  collectVisibleFixtureInputs();

  currentLeague = leagueSelect.value;
  teams = leagues[currentLeague].teams;

  loadFixtures();
  renderTeamFilter();
  refreshApp();
  saveToFirebase();
});

fixturesList.addEventListener("click", event => {
  if (event.target.classList.contains("save-btn")) {
    saveFixtureResult(event.target.dataset.id);
  }
});

fixturesList.addEventListener("input", event => {
  if (
    event.target.classList.contains("home-score") ||
    event.target.classList.contains("away-score")
  ) {
    collectVisibleFixtureInputs();
    calculateTable();
    renderTable();
  }
});

teamFilter.addEventListener("change", () => {
  collectVisibleFixtureInputs();
  renderFixtures();
});

resetBtn.addEventListener("click", () => {
  const confirmReset = confirm("Are you sure you want to reset the whole season?");

  if (!confirmReset) return;

  fixtures = [];
  localStorage.removeItem(leagueStorageKey());

  generateFixtures();
  refreshApp();
  saveToFirebase();
});

/* =========================
   AUTH
========================= */

onAuthStateChanged(auth, async user => {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const userStatus = document.getElementById("userStatus");

  currentUser = user;
  firebaseReady = true;

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    userStatus.textContent = `Signed in as ${user.email}`;

    await loadFromFirebase();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    userStatus.textContent = "Not signed in";
  }

  init();
});

/* =========================
   INIT
========================= */

function init() {
  teams = leagues[currentLeague].teams;
  loadFixtures();
  renderTeamFilter();
  refreshApp();
}