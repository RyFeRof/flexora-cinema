import { Routes, Route } from "react-router-dom"
import Cinema from "./pages/cinema/cinema"
import Player from "./pages/player/player"
import Add from './pages/add/add';
export default function App(){
  return (
    <Routes>
      <Route path='/' element={<Cinema></Cinema>}/>
      <Route path="/watch" element={<Player/>}></Route>
      <Route path='/add' element={<Add/>}></Route>
    </Routes>
  )
}