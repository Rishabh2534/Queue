import { useState } from 'react'

import './App.css'
import Navigation from './components/navigation'
import Home from './components/HomePage'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Queue from "./components/Queue";
import JoinQueue from "./components/User";
import LoginSignUp from './components/LoginSignUp';



function App() {
 

  return (
    <>
     <Router>
      <Navigation/>
     
            <Routes>
                <Route path="/loginSignup/:act" element={<LoginSignUp/>} />
                <Route path="/" element={<Home/>} />
                <Route path="/Queue/:userId" element={<Queue />} />
                <Route path="/join/:userId" element={<JoinQueue />} />
            </Routes>
      
      
      </Router>
    </>
  )
}

export default App
