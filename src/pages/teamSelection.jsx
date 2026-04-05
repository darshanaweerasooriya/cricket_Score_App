import React, { useState, useEffect } from "react";
import "./teamselection.css";
import jsPDF from "jspdf";

function TeamAssignment() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");

  const [teams, setTeams] = useState(null);
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");

  const [swapMode, setSwapMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [captains, setCaptains] = useState({
    teamA: "",
    teamB: ""
  });

  // Load saved data
  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    const savedCaptains = localStorage.getItem("captains");

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedCaptains) setCaptains(JSON.parse(savedCaptains));
  }, []);

  // Add player
  const addPlayer = () => {
    if (!name.trim()) return;

    setPlayers([
      ...players,
      { id: Date.now(), name: name.trim(), gender }
    ]);
    setName("");
  };

  // Edit player
  const editPlayer = (id, field, value) => {
    setPlayers(players.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  // Shuffle
  const shuffle = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // Generate teams
  const generateTeams = () => {
    if (players.length < 2) return;

    const males = shuffle(players.filter(p => p.gender === "male"));
    const females = shuffle(players.filter(p => p.gender === "female"));

    const split = (arr) => {
      const mid = Math.ceil(arr.length / 2);
      return [arr.slice(0, mid), arr.slice(mid)];
    };

    const [mA, mB] = split(males);
    const [fA, fB] = split(females);

    const teamA = [...mA, ...fA];
    const teamB = [...mB, ...fB];

    const newTeams = { teamA, teamB };
    setTeams(newTeams);

    localStorage.setItem("teams", JSON.stringify(newTeams));
  };

  // Swap players
  const handleSwap = (team, player) => {
    if (!swapMode) return;

    if (!selectedPlayer) {
      setSelectedPlayer({ team, player });
    } else {
      const newTeams = { ...teams };

      const otherTeam = selectedPlayer.team;
      const p1 = selectedPlayer.player;
      const p2 = player;

      newTeams[team] = newTeams[team].map(p =>
        p.id === p2.id ? p1 : p
      );

      newTeams[otherTeam] = newTeams[otherTeam].map(p =>
        p.id === p1.id ? p2 : p
      );

      setTeams(newTeams);
      setSelectedPlayer(null);
      setSwapMode(false);

      localStorage.setItem("teams", JSON.stringify(newTeams));
    }
  };

  // Captain change
  const handleCaptainChange = (teamKey, value) => {
    const updated = {
      ...captains,
      [teamKey]: value
    };

    setCaptains(updated);
    localStorage.setItem("captains", JSON.stringify(updated));
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text(teamAName, 10, 10);

    teams.teamA.forEach((p, i) => {
      const isCaptain = captains.teamA == p.id;
      doc.text(
        `${p.name} (${p.gender}) ${isCaptain ? "👑" : ""}`,
        10,
        20 + i * 10
      );
    });

    doc.text(teamBName, 100, 10);

    teams.teamB.forEach((p, i) => {
      const isCaptain = captains.teamB == p.id;
      doc.text(
        `${p.name} (${p.gender}) ${isCaptain ? "👑" : ""}`,
        100,
        20 + i * 10
      );
    });

    doc.save("teams.pdf");
  };

  // Reset all
  const resetAll = () => {
    if (!window.confirm("Are you sure you want to reset everything?")) return;

    setPlayers([]);
    setTeams(null);
    setTeamAName("Team A");
    setTeamBName("Team B");
    setSwapMode(false);
    setSelectedPlayer(null);
    setCaptains({ teamA: "", teamB: "" });

    localStorage.removeItem("teams");
    localStorage.removeItem("captains");
  };

  return (
    <div className="container">
      <h1>🏏 Team Assignment</h1>

      {/* Add Player */}
      <div className="form">
        <input
          type="text"
          placeholder="Enter player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <button onClick={addPlayer}>Add</button>
      </div>

      {/* Player List */}
      <div className="players">
        <h2>Players ({players.length})</h2>

        {players.length === 0 && <p>No players added yet</p>}

        {players.map((p) => (
          <div key={p.id} className="player">
            <input
              value={p.name}
              onChange={(e) => editPlayer(p.id, "name", e.target.value)}
            />

            <select
              value={p.gender}
              onChange={(e) => editPlayer(p.id, "gender", e.target.value)}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        ))}
      </div>

      {/* Team Names */}
      <div className="team-names">
        <input
          value={teamAName}
          onChange={(e) => setTeamAName(e.target.value)}
        />
        <input
          value={teamBName}
          onChange={(e) => setTeamBName(e.target.value)}
        />
      </div>

      {/* Buttons */}
      <div style={{ marginTop: "20px" }}>
        <button className="generate-btn" onClick={generateTeams}>
          Generate Teams
        </button>

        <button
          className="swap-btn"
          style={{ marginLeft: "10px" }}
          onClick={() => {
            setSwapMode(!swapMode);
            setSelectedPlayer(null);
          }}
        >
          {swapMode ? "Cancel Swap" : "Swap Players"}
        </button>

        <button
          style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}
          onClick={resetAll}
        >
          Reset All
        </button>
      </div>

      {/* Teams */}
      {teams && (
        <div className="teams">
          {["teamA", "teamB"].map((teamKey, index) => (
            <div key={teamKey} className="team">
              <h2>{index === 0 ? teamAName : teamBName}</h2>

              {/* Captain Selection */}
              <select
                value={captains[teamKey] || ""}
                onChange={(e) => handleCaptainChange(teamKey, e.target.value)}
              >
                <option value="">Select Captain</option>
                {teams[teamKey].map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Players */}
              {teams[teamKey].map((p) => (
                <div
                  key={p.id}
                  className={`player ${
                    selectedPlayer?.player.id === p.id ? "selected" : ""
                  }`}
                  onClick={() => handleSwap(teamKey, p)}
                >
                  {p.name} ({p.gender})
                  {captains[teamKey] == p.id && " 👑"}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Export */}
      {teams && (
        <button className="generate-btn" onClick={exportPDF}>
          📄 Export PDF
        </button>
      )}
    </div>
  );
}

export default TeamAssignment;