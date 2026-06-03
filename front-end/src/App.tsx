import { Routes, Route } from "react-router-dom"
import Cinema from "./pages/cinema/cinema"
import Player from "./pages/player/player"
export default function App(){
  return (
    <Routes>
      <Route path='/' element={<Cinema></Cinema>}/>\
      <Route path="/watch" element={<Player/>}></Route>
    </Routes>
  )
}