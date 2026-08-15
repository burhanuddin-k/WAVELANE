import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { getToken } from './api.js';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const isAuthed = Boolean(getToken());

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthed ? <Navigate to="/" /> : <Login onLoggedIn={setAdmin} />}
      />
      <Route
        path="/"
        element={
          isAuthed ? (
            <Dashboard admin={admin} onLogout={() => setAdmin(null)} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
