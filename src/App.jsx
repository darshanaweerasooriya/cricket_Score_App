import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/loginPage";
import TeamAssignment from "./pages/teamSelection";

function App() {
  const isAuth = localStorage.getItem("auth");

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/teams"
          element={
            isAuth ? <TeamAssignment /> : <Navigate to="/" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;