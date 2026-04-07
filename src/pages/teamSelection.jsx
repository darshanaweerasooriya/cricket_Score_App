import React, { useState, useEffect } from "react";
import "./teamselection.css";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";

function TeamAssignment() {
  const navigate = useNavigate();

  // 🔒 DEV LOCK (change to false to enable buttons)
  const DEV_LOCK = true;

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

  const generateTeams = () => {
    if (players.length < 2) return;

    const males = shuffle(players.filter(p => p.gender === "male"));
    const females = shuffle(players.filter(p => p.gender === "female"));

    const split = arr => {
      const mid = Math.ceil(arr.length / 2);
      return [arr.slice(0, mid), arr.slice(mid)];
    };

    const [mA, mB] = split(males);
    const [fA, fB] = split(females);

    const newTeams = {
      teamA: [...mA, ...fA],
      teamB: [...mB, ...fB]
    };

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

  // 🎨 Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("🏏 Team Assignment", 70, 10);

  // 🔵 Team A Header
  doc.setFontSize(14);
  doc.setTextColor(0, 102, 204); // blue
  doc.text(teamAName, 20, 30);

  // 🔴 Team B Header
  doc.setTextColor(204, 0, 0); // red
  doc.text(teamBName, 120, 30);

  // Reset font for players
  doc.setFontSize(11);

  // 🟦 Team A Players
  teams.teamA.forEach((p, i) => {
    const y = 40 + i * 8;
    const isCaptain = captains.teamA == p.id;

    // Gender color
    if (p.gender === "male") {
      doc.setTextColor(0, 0, 255); // blue
    } else {
      doc.setTextColor(255, 105, 180); // pink
    }

    doc.text(
      `${p.name} ${isCaptain ? "(Captain 👑)" : ""}`,
      20,
      y
    );
  });

  // 🟥 Team B Players
  teams.teamB.forEach((p, i) => {
    const y = 40 + i * 8;
    const isCaptain = captains.teamB == p.id;

    if (p.gender === "male") {
      doc.setTextColor(0, 0, 255);
    } else {
      doc.setTextColor(255, 105, 180);
    }

    doc.text(
      `${p.name} ${isCaptain ? "(Captain 👑)" : ""}`,
      120,
      y
    );
  });

  // 📦 Add border box
  doc.setDrawColor(0);
  doc.rect(10, 20, 190, 120);

  // 💾 Save
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

            <button
              className="btn-primary"
              onClick={addPlayer}
              style={{ marginTop: "15px" }}
            >
              Add Player
            </button>
          </div>

          <div className="card">
            <h3>Players</h3>

            {players.map(p => (
              <div key={p.id} className="player">
                <div style={{ flex: 2 }}>
                  <input
                    value={p.name}
                    onChange={e => editPlayer(p.id, "name", e.target.value)}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <select
                    value={p.gender}
                    onChange={e => editPlayer(p.id, "gender", e.target.value)}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
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
              style={{ marginBottom: "10px" }}
            />

            <input
              value={teamBName}
              onChange={e => setTeamBName(e.target.value)}
            />

            <div className="toolbar">
              {/* 🔒 Disabled Buttons */}
              <button className="btn-primary" onClick={generateTeams} disabled={DEV_LOCK}>
                Generate Teams
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  setSwapMode(!swapMode);
                  setSelectedPlayer(null);
                }}
                disabled={DEV_LOCK}
              >
                {swapMode ? "Cancel Swap" : "Swap Players"}
              </button>

              <button className="btn-danger" onClick={resetAll} disabled={DEV_LOCK}>
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
                    className="captain-select"
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
                      className="player"
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
            <button className="btn-primary" onClick={exportPDF}>
              Export PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamAssignment;