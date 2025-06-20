import './App.css'
import { Routes, Route, Link } from "react-router-dom"
import Offers from "./Offers.tsx";
import OfferDetail from "./OfferDetail.tsx";
import TopDestinations from "./TopDestinations.tsx";
import Login from "./Login.tsx";


function App() {

  return (
    <>
      <nav className="bg-zinc-800 text-zinc-100 px-6 py-3 flex gap-6">
        <Link to="/offers" className="hover:underline">Offres</Link>
        <Link to="/stats" className="hover:underline">Stats</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/offers/:id" element={<OfferDetail />} />
        <Route path="/stats" element={<TopDestinations />} />

      </Routes>
    </>
  )
}

export default App
