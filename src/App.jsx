import { BrowserRouter, Routes, Route } from "react-router-dom";
import TeamAssignment from "./pages/teamSelection";

function App(){
  return (
    <BrowserRouter>
    
    <Routes>
      <Route path='/' element={<TeamAssignment/>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App;