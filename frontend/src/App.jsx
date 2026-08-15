import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import PlayerBar from './components/PlayerBar.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-scroll">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>
      <PlayerBar />
    </div>
  );
}
