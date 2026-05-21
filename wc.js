const groups = {
  A: ["Mexico", "South Africa", "South Korea", "Czech Republic"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Scotland", "Haiti"],
  D: ["USA", "Paraguay", "Australia", "Turkey"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Tunisia", "Sweden"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Saudi Arabia", "Uruguay", "Cape Verde"],
  I: ["France", "Senegal", "Norway", "Iraq"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Colombia", "Uzbekistan"],
  L: ["England", "Croatia", "Panama", "Ghana"]
};

const flags = {
  "Mexico": "assets/flags/mexico.png",
  "South Africa": "assets/flags/south-africa.png",
  "South Korea": "assets/flags/south-korea.png",
  "Czech Republic": "assets/flags/czech-republic.png",
  "Canada": "assets/flags/canada.png",
  "Bosnia and Herzegovina": "assets/flags/bosnia-and-herzegovina.png",
  "Qatar": "assets/flags/qatar.png",
  "Switzerland": "assets/flags/switzerland.png",
  "Brazil": "assets/flags/brazil.png",
  "Morocco": "assets/flags/morocco.png",
  "Scotland": "assets/flags/scotland.png",
  "Haiti": "assets/flags/haiti.png",
  "USA": "assets/flags/usa.png",
  "Paraguay": "assets/flags/paraguay.png",
  "Australia": "assets/flags/australia.png",
  "Turkey": "assets/flags/turkey.png",
  "Germany": "assets/flags/germany.png",
  "Curaçao": "assets/flags/curacao.png",
  "Ivory Coast": "assets/flags/ivory-coast.png",
  "Ecuador": "assets/flags/ecuador.png",
  "Netherlands": "assets/flags/netherlands.png",
  "Japan": "assets/flags/japan.png",
  "Tunisia": "assets/flags/tunisia.png",
  "Sweden": "assets/flags/sweden.png",
  "Belgium": "assets/flags/belgium.png",
  "Egypt": "assets/flags/egypt.png",
  "Iran": "assets/flags/iran.png",
  "New Zealand": "assets/flags/new-zealand.png",
  "Spain": "assets/flags/spain.png",
  "Saudi Arabia": "assets/flags/saudi-arabia.png",
  "Uruguay": "assets/flags/uruguay.png",
  "Cape Verde": "assets/flags/cape-verde.png",
  "France": "assets/flags/france.png",
  "Senegal": "assets/flags/senegal.png",
  "Norway": "assets/flags/norway.png",
  "Iraq": "assets/flags/iraq.png",
  "Argentina": "assets/flags/argentina.png",
  "Algeria": "assets/flags/algeria.png",
  "Austria": "assets/flags/austria.png",
  "Jordan": "assets/flags/jordan.png",
  "Portugal": "assets/flags/portugal.png",
  "DR Congo": "assets/flags/dr-congo.png",
  "Colombia": "assets/flags/colombia.png",
  "Uzbekistan": "assets/flags/uzbekistan.png",
  "England": "assets/flags/england.png",
  "Croatia": "assets/flags/croatia.png",
  "Panama": "assets/flags/panama.png",
  "Ghana": "assets/flags/ghana.png"
};

let results = JSON.parse(localStorage.getItem("worldCupResults")) || {};
let knockoutResults = JSON.parse(localStorage.getItem("worldCupKnockoutResults")) || {};

let thirdPlaceAssignments = JSON.parse(localStorage.getItem("worldCupThirdPlaceAssignments")) || {};

const fixturesList = document.getElementById("fixturesList");
const groupTables = document.getElementById("groupTables");
const qualifiedList = document.getElementById("qualifiedList");
const groupFilter = document.getElementById("groupFilter");
const resetBtn = document.getElementById("resetBtn");

function getFlag(team) {
  if (!flags[team]) return "";
  return `<img class="flag" src="${flags[team]}" alt="${team} flag">`;
}

function teamWithFlag(team, extraClass = "") {
  return `
    <div class="team-cell ${extraClass}">
      ${getFlag(team)}
      <span>${team}</span>
    </div>
  `;
}

Object.keys(groups).forEach(group => {
  const option = document.createElement("option");
  option.value = group;
  option.textContent = `Group ${group}`;
  groupFilter.appendChild(option);
});

function createFixtures() {
  const fixtures = [];

  Object.entries(groups).forEach(([group, teams]) => {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          id: `${group}-${i}-${j}`,
          group,
          home: teams[i],
          away: teams[j]
        });
      }
    }
  });

  return fixtures;
}

const fixtures = createFixtures();

function saveResults() {
  localStorage.setItem("worldCupResults", JSON.stringify(results));
}

function saveKnockoutResults() {
  localStorage.setItem("worldCupKnockoutResults", JSON.stringify(knockoutResults));
}

function renderFixtures() {
  fixturesList.innerHTML = "";

  const selectedGroup = groupFilter.value;

  fixtures
    .filter(fixture => selectedGroup === "all" || fixture.group === selectedGroup)
    .forEach(fixture => {
      const result = results[fixture.id] || {};

      const div = document.createElement("div");
      div.className = "fixture";

      div.innerHTML = `
        <div class="fixture-group">Group ${fixture.group}</div>

        <div class="home">${teamWithFlag(fixture.home, "home-team")}</div>

        <input class="score-input" type="number" min="0"
          value="${result.home ?? ""}"
          data-id="${fixture.id}" data-team="home">

        <span>-</span>

        <input class="score-input" type="number" min="0"
          value="${result.away ?? ""}"
          data-id="${fixture.id}" data-team="away">

        <div class="away">${teamWithFlag(fixture.away, "away-team")}</div>
      `;

      fixturesList.appendChild(div);
    });

  document.querySelectorAll(".score-input").forEach(input => {
    input.addEventListener("input", handleScoreInput);
  });
}

function handleScoreInput(e) {
  const id = e.target.dataset.id;
  const team = e.target.dataset.team;

  if (!results[id]) results[id] = {};

  results[id][team] = e.target.value === "" ? "" : Number(e.target.value);

  saveResults();
  renderTables();
}

function blankStats(team, group) {
  return {
    team,
    group,
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

function calculateTables() {
  const tables = {};

  Object.entries(groups).forEach(([group, teams]) => {
    tables[group] = {};
    teams.forEach(team => {
      tables[group][team] = blankStats(team, group);
    });
  });

  fixtures.forEach(fixture => {
    const result = results[fixture.id];

    if (!result || result.home === "" || result.away === "" || result.home === undefined || result.away === undefined) return;

    const homeStats = tables[fixture.group][fixture.home];
    const awayStats = tables[fixture.group][fixture.away];

    const homeGoals = Number(result.home);
    const awayGoals = Number(result.away);

    homeStats.played++;
    awayStats.played++;

    homeStats.gf += homeGoals;
    homeStats.ga += awayGoals;
    awayStats.gf += awayGoals;
    awayStats.ga += homeGoals;

    if (homeGoals > awayGoals) {
      homeStats.won++;
      awayStats.lost++;
      homeStats.points += 3;
    } else if (homeGoals < awayGoals) {
      awayStats.won++;
      homeStats.lost++;
      awayStats.points += 3;
    } else {
      homeStats.drawn++;
      awayStats.drawn++;
      homeStats.points++;
      awayStats.points++;
    }

    homeStats.gd = homeStats.gf - homeStats.ga;
    awayStats.gd = awayStats.gf - awayStats.ga;
  });

  const sortedTables = {};

  Object.entries(tables).forEach(([group, teams]) => {
    sortedTables[group] = Object.values(teams).sort(sortTeams);
  });

  return sortedTables;
}

function sortTeams(a, b) {
  return (
    b.points - a.points ||
    b.gd - a.gd ||
    b.gf - a.gf ||
    a.team.localeCompare(b.team)
  );
}

function renderTables() {
  const tables = calculateTables();

  groupTables.innerHTML = "";

  Object.entries(tables).forEach(([group, teams]) => {
    const div = document.createElement("div");
    div.className = "group-table";

    div.innerHTML = `
      <h3>Group ${group}</h3>
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
          </tr>
        </thead>
        <tbody>
          ${teams.map((team, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${teamWithFlag(team.team)}</td>
              <td>${team.played}</td>
              <td>${team.won}</td>
              <td>${team.drawn}</td>
              <td>${team.lost}</td>
              <td>${team.gf}</td>
              <td>${team.ga}</td>
              <td>${team.gd}</td>
              <td><strong>${team.points}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    groupTables.appendChild(div);
  });

  renderQualifiedTeams(tables);
  renderKnockoutStage(tables);
}

function getQualifiedData(tables) {
  const winners = {};
  const runnersUp = {};
  const thirdPlaced = [];

  Object.entries(tables).forEach(([group, teams]) => {
    winners[group] = teams[0];
    runnersUp[group] = teams[1];
    thirdPlaced.push(teams[2]);
  });

  thirdPlaced.sort(sortTeams);

  const bestThird = thirdPlaced.slice(0, 8);
  const bestThirdGroups = bestThird.map(team => team.group);

  return { winners, runnersUp, bestThird, bestThirdGroups };
}

function renderQualifiedTeams(tables) {
  qualifiedList.innerHTML = "";

  const { winners, runnersUp, bestThird } = getQualifiedData(tables);

  const allQualified = [
    ...Object.entries(winners).map(([group, team]) => ({ ...team, status: `Group ${group} winner` })),
    ...Object.entries(runnersUp).map(([group, team]) => ({ ...team, status: `Group ${group} runner-up` })),
    ...bestThird.map(team => ({ ...team, status: `Best third-place team` }))
  ];

  allQualified.forEach(team => {
    const div = document.createElement("div");
    div.className = "qualified-card";

    div.innerHTML = `
      <span class="badge">${team.status}</span>
      <h3>${teamWithFlag(team.team)}</h3>
      <p>Group ${team.group}</p>
      <p>${team.points} pts | GD ${team.gd} | GF ${team.gf}</p>
    `;

    qualifiedList.appendChild(div);
  });
}

function saveThirdPlaceAssignments() {
  localStorage.setItem("worldCupThirdPlaceAssignments", JSON.stringify(thirdPlaceAssignments));
}

function pickThirdTeam(possibleGroups, qualifiedData, slotId) {
  const availableTeams = qualifiedData.bestThird.filter(team =>
    possibleGroups.includes(team.group)
  );

  if (availableTeams.length === 0) {
    return `3rd Group ${possibleGroups.join("/")}`;
  }

  const currentPick = thirdPlaceAssignments[slotId];

  if (currentPick && availableTeams.some(team => team.team === currentPick)) {
    return currentPick;
  }

  const usedTeams = Object.values(thirdPlaceAssignments);

  const unusedTeams = availableTeams.filter(team =>
    !usedTeams.includes(team.team)
  );

  const pool = unusedTeams.length > 0 ? unusedTeams : availableTeams;

  const randomTeam = pool[Math.floor(Math.random() * pool.length)];

  thirdPlaceAssignments[slotId] = randomTeam.team;
  saveThirdPlaceAssignments();

  return randomTeam.team;
}

function getSlotTeam(slot, qualifiedData, matchId = "") {
  const { winners, runnersUp } = qualifiedData;

  if (slot.startsWith("MW")) {
    const id = slot.replace("MW", "");
    return getMatchWinner(id) || `Winner Match ${id}`;
  }

  if (slot.startsWith("ML")) {
    const id = slot.replace("ML", "");
    return getMatchLoser(id) || `Loser Match ${id}`;
  }

  if (slot.startsWith("W")) {
    const group = slot.replace("W", "");
    return winners[group]?.team || `Winner Group ${group}`;
  }

  if (slot.startsWith("R")) {
    const group = slot.replace("R", "");
    return runnersUp[group]?.team || `Runner-up Group ${group}`;
  }

  if (slot.startsWith("T")) {
    const possibleGroups = slot.replace("T", "").split("");
    return pickThirdTeam(possibleGroups, qualifiedData, `${matchId}-${slot}`);
  }

  return slot;
}

function getMatchWinner(matchId) {
  const match = knockoutResults[matchId];

  if (!match || match.home === "" || match.away === "" || match.home === undefined || match.away === undefined) {
    return null;
  }

  if (Number(match.home) > Number(match.away)) return match.homeTeam;
  if (Number(match.away) > Number(match.home)) return match.awayTeam;

  return null;
}

function getMatchLoser(matchId) {
  const match = knockoutResults[matchId];

  if (!match || match.home === "" || match.away === "" || match.home === undefined || match.away === undefined) {
    return null;
  }

  if (Number(match.home) < Number(match.away)) return match.homeTeam;
  if (Number(match.away) < Number(match.home)) return match.awayTeam;

  return null;
}

const knockoutMatches = [
  { id: "74", round: "Round of 32", date: "June 29", city: "Foxborough", home: "WE", away: "TABCDF" },
  { id: "77", round: "Round of 32", date: "June 30", city: "East Rutherford", home: "WI", away: "TCDFGH" },
  { id: "73", round: "Round of 32", date: "June 28", city: "Inglewood", home: "RA", away: "RB" },
  { id: "75", round: "Round of 32", date: "June 29", city: "Guadalupe", home: "WF", away: "RC" },

  { id: "83", round: "Round of 32", date: "July 2", city: "Toronto", home: "RK", away: "RL" },
  { id: "84", round: "Round of 32", date: "July 2", city: "Inglewood", home: "WH", away: "RJ" },
  { id: "81", round: "Round of 32", date: "July 1", city: "Santa Clara", home: "WD", away: "TBEFIJ" },
  { id: "82", round: "Round of 32", date: "July 1", city: "Seattle", home: "WG", away: "TAEHIJ" },

  { id: "76", round: "Round of 32", date: "June 29", city: "Houston", home: "WC", away: "RF" },
  { id: "78", round: "Round of 32", date: "June 30", city: "Arlington", home: "RE", away: "RI" },
  { id: "79", round: "Round of 32", date: "June 30", city: "Mexico City", home: "WA", away: "TCEFHI" },
  { id: "80", round: "Round of 32", date: "July 1", city: "Atlanta", home: "WL", away: "TEHIJK" },

  { id: "86", round: "Round of 32", date: "July 3", city: "Miami Gardens", home: "WJ", away: "RH" },
  { id: "88", round: "Round of 32", date: "July 3", city: "Arlington", home: "RD", away: "RG" },
  { id: "85", round: "Round of 32", date: "July 2", city: "Vancouver", home: "WB", away: "TEFGIJ" },
  { id: "87", round: "Round of 32", date: "July 3", city: "Kansas City", home: "WK", away: "TDEIJL" },

  { id: "89", round: "Round of 16", date: "July 4", city: "Philadelphia", home: "MW74", away: "MW77" },
  { id: "90", round: "Round of 16", date: "July 4", city: "Houston", home: "MW73", away: "MW75" },
  { id: "93", round: "Round of 16", date: "July 6", city: "Arlington", home: "MW83", away: "MW84" },
  { id: "94", round: "Round of 16", date: "July 6", city: "Seattle", home: "MW81", away: "MW82" },

  { id: "91", round: "Round of 16", date: "July 5", city: "East Rutherford", home: "MW76", away: "MW78" },
  { id: "92", round: "Round of 16", date: "July 5", city: "Mexico City", home: "MW79", away: "MW80" },
  { id: "95", round: "Round of 16", date: "July 7", city: "Atlanta", home: "MW86", away: "MW88" },
  { id: "96", round: "Round of 16", date: "July 7", city: "Vancouver", home: "MW85", away: "MW87" },

  { id: "97", round: "Quarter-finals", date: "July 9", city: "Foxborough", home: "MW89", away: "MW90" },
  { id: "98", round: "Quarter-finals", date: "July 10", city: "Inglewood", home: "MW93", away: "MW94" },
  { id: "99", round: "Quarter-finals", date: "July 11", city: "Miami Gardens", home: "MW91", away: "MW92" },
  { id: "100", round: "Quarter-finals", date: "July 11", city: "Kansas City", home: "MW95", away: "MW96" },

  { id: "101", round: "Semi-finals", date: "July 14", city: "Arlington", home: "MW97", away: "MW98" },
  { id: "102", round: "Semi-finals", date: "July 15", city: "Atlanta", home: "MW99", away: "MW100" },

  { id: "103", round: "Third-place play-off", date: "July 18", city: "Miami Gardens", home: "ML101", away: "ML102" },
  { id: "104", round: "Final", date: "July 19", city: "East Rutherford", home: "MW101", away: "MW102" }
];

function ensureKnockoutSection() {
  let section = document.getElementById("knockoutStage");

  if (!section) {
    section = document.createElement("section");
    section.id = "knockoutStage";
    section.className = "card wide-card";

    section.innerHTML = `
      <div class="section-header">
        <div>
          <p class="eyebrow">Tournament bracket</p>
          <h2>Knockout Stage</h2>
        </div>
      </div>

      <div id="knockoutList" class="knockout-list"></div>
    `;

    document.querySelector(".main-grid").appendChild(section);
  }
}

function renderKnockoutStage(tables) {
  ensureKnockoutSection();

  const knockoutList = document.getElementById("knockoutList");
  const qualifiedData = getQualifiedData(tables);

  knockoutList.innerHTML = "";

  const rounds = [...new Set(knockoutMatches.map(match => match.round))];

  rounds.forEach(round => {
    const roundDiv = document.createElement("div");
    roundDiv.className = "knockout-round";

    roundDiv.innerHTML = `<h3>${round}</h3>`;

    knockoutMatches
      .filter(match => match.round === round)
      .forEach(match => {
     const homeTeam = getSlotTeam(match.home, qualifiedData, match.id);
const awayTeam = getSlotTeam(match.away, qualifiedData, match.id);

        if (!knockoutResults[match.id]) knockoutResults[match.id] = {};

        knockoutResults[match.id].homeTeam = homeTeam;
        knockoutResults[match.id].awayTeam = awayTeam;

        const result = knockoutResults[match.id];

        const matchDiv = document.createElement("div");
        matchDiv.className = "knockout-match";

        matchDiv.innerHTML = `
          <div class="knockout-meta">Match ${match.id} · ${match.date} · ${match.city}</div>

          <div class="knockout-team">
            ${teamWithFlag(homeTeam)}
            <input class="knockout-score" type="number" min="0"
              value="${result.home ?? ""}"
              data-match="${match.id}" data-team="home">
          </div>

          <div class="knockout-team">
            ${teamWithFlag(awayTeam)}
            <input class="knockout-score" type="number" min="0"
              value="${result.away ?? ""}"
              data-match="${match.id}" data-team="away">
          </div>
        `;

        roundDiv.appendChild(matchDiv);
      });

    knockoutList.appendChild(roundDiv);
  });

  document.querySelectorAll(".knockout-score").forEach(input => {
    input.addEventListener("input", handleKnockoutScoreInput);
  });

  saveKnockoutResults();
}

function handleKnockoutScoreInput(e) {
  const matchId = e.target.dataset.match;
  const team = e.target.dataset.team;

  if (!knockoutResults[matchId]) knockoutResults[matchId] = {};

  knockoutResults[matchId][team] = e.target.value === "" ? "" : Number(e.target.value);

  saveKnockoutResults();
  renderTables();
}

groupFilter.addEventListener("change", renderFixtures);

resetBtn.addEventListener("click", () => {
  if (confirm("Reset all World Cup predictions?")) {
    results = {};
    knockoutResults = {};
    thirdPlaceAssignments = {};
    localStorage.removeItem("worldCupResults");
    localStorage.removeItem("worldCupKnockoutResults");
    localStorage.removeItem("worldCupThirdPlaceAssignments");
    renderFixtures();
    renderTables();
  }
});

renderFixtures();
renderTables();