import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route } from "react-router-dom"
import Offers from "./Offers.tsx";
import OfferDetail from "./OfferDetail.tsx";
import Login from "./Login.tsx";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Offers />} />
        <Route path="/offers/:id" element={<OfferDetail />} />
      </Routes>
    </>
  )
}

export default App
