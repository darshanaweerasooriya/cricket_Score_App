import React, { useState, useEffect } from "react";
import "./teamselection.css";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

function TeamAssignment() {
  const navigate = useNavigate();

  const DEV_LOCK = false;

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

  useEffect(() => {
    if (!localStorage.getItem("auth")) navigate("/");
  }, [navigate]);

  useEffect(() => {
    const savedTeams = localStorage.getItem("teams");
    const savedCaptains = localStorage.getItem("captains");

    if (savedTeams) setTeams(JSON.parse(savedTeams));
    if (savedCaptains) setCaptains(JSON.parse(savedCaptains));
  }, []);

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/");
  };

  const addPlayer = () => {
    if (!name.trim()) return;

    setPlayers([...players, { id: Date.now(), name: name.trim(), gender }]);
    setName("");
  };

  const editPlayer = (id, field, value) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  // ✅ UPDATED: PAIR-BASED TEAM GENERATION
  const generateTeams = () => {
    if (players.length < 2) return;

    const shuffled = shuffle(players);

    // Step 1: Create pairs
    const pairs = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        pairs.push([shuffled[i], shuffled[i + 1]]);
      } else {
        pairs.push([shuffled[i]]); // odd player
      }
    }

    // Step 2: Assign pairs alternately
    const teamA = [];
    const teamB = [];

    pairs.forEach((pair, index) => {
      if (index % 2 === 0) {
        teamA.push(...pair);
      } else {
        teamB.push(...pair);
      }
    });

    const newTeams = { teamA, teamB };

    setTeams(newTeams);
    localStorage.setItem("teams", JSON.stringify(newTeams));
  };

  const handleSwap = (team, player) => {
    if (!swapMode) return;

    if (!selectedPlayer) {
      setSelectedPlayer({ team, player });
    } else {
      const newTeams = { ...teams };

      const p1 = selectedPlayer.player;
      const p2 = player;
      const otherTeam = selectedPlayer.team;

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

  const handleCaptainChange = (teamKey, value) => {
    const updated = { ...captains, [teamKey]: value };
    setCaptains(updated);
    localStorage.setItem("captains", JSON.stringify(updated));
  };

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

  const resetAll = () => {
    if (!window.confirm("Reset everything?")) return;

    setPlayers([]);
    setTeams(null);
    setCaptains({ teamA: "", teamB: "" });

    localStorage.removeItem("teams");
    localStorage.removeItem("captains");
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🏏 Team Assignment</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="layout">

        {/* LEFT */}
        <div className="left">
          <div className="card add-player">
            <h3>Add Player</h3>

            <input
              placeholder="Enter player name"
              value={name}
              onChange={e => setName(e.target.value)}
            />

            <select value={gender} onChange={e => setGender(e.target.value)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <button className="btn-primary" onClick={addPlayer}>
              Add Player
            </button>
          </div>

          <div className="card">
            <h3>Players</h3>

            {players.map(p => (
              <div key={p.id} className="player">
                <input
                  value={p.name}
                  onChange={e => editPlayer(p.id, "name", e.target.value)}
                />

                <select
                  value={p.gender}
                  onChange={e => editPlayer(p.id, "gender", e.target.value)}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="card">
            <h3>Team Names</h3>

            <input
              value={teamAName}
              onChange={e => setTeamAName(e.target.value)}
            />

            <input
              value={teamBName}
              onChange={e => setTeamBName(e.target.value)}
            />

            <div className="toolbar">
              <button onClick={generateTeams} disabled={DEV_LOCK}>
                Generate Teams
              </button>

              <button
                onClick={() => {
                  setSwapMode(!swapMode);
                  setSelectedPlayer(null);
                }}
                disabled={DEV_LOCK}
              >
                {swapMode ? "Cancel Swap" : "Swap Players"}
              </button>

              <button onClick={resetAll} disabled={DEV_LOCK}>
                Reset
              </button>
            </div>
          </div>

          {teams && (
            <div className="teams">
              {["teamA", "teamB"].map((teamKey, index) => (
                <div key={teamKey} className="team card">
                  <h2>{index === 0 ? teamAName : teamBName}</h2>

                  <select
                    value={captains[teamKey] || ""}
                    onChange={e => handleCaptainChange(teamKey, e.target.value)}
                  >
                    <option value="">Select Captain</option>
                    {teams[teamKey].map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  {teams[teamKey].map(p => (
                    <div
                      key={p.id}
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

          {teams && (
            <button onClick={exportPDF}>
              Export PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamAssignment;