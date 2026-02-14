import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async (currentSession) => {
      if (currentSession?.user) {
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('id')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        setIsAdmin(!!adminRecord);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkUser(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyItems: 'center', width: '100%' }}>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', fontFamily: 'Outfit' }}>Cargando Solemia...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : (isAdmin ? <Navigate to="/admin" /> : <Navigate to="/" />)}
        />
        <Route
          path="/signup"
          element={!session ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={session ? (isAdmin ? <Navigate to="/admin" /> : <Dashboard session={session} />) : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={session ? (isAdmin ? <Admin session={session} /> : <Navigate to="/" />) : <AdminLogin />}
        />
      </Routes>
    </Router>
  );
}

export default App;
