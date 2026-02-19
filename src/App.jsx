import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SuspendedScreen from './pages/SuspendedScreen';

import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async (currentSession) => {
      if (currentSession?.user) {
        // 1. Check if Admin
        const { data: adminRecord } = await supabase
          .from('admins')
          .select('id')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        const adminStatus = !!adminRecord;
        setIsAdmin(adminStatus);

        // 2. If not admin, check if active tenant
        if (!adminStatus) {
          const { data: tenantRecord } = await supabase
            .from('tenants')
            .select('is_active')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          // Si no existe el registro o is_active es false, suspendemos
          setIsSuspended(tenantRecord ? !tenantRecord.is_active : true);
        } else {
          setIsSuspended(false);
        }
      } else {
        setIsAdmin(false);
        setIsSuspended(false);
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
          <h2 style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>Cargando Solemia...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!session ? <Login /> : (isAdmin ? <Navigate to="/admin" /> : (isSuspended ? <Navigate to="/suspended" /> : <Navigate to="/" />))}
        />
        <Route
          path="/signup"
          element={!session ? <Signup /> : <Navigate to="/" />}
        />
        <Route
          path="/suspended"
          element={session && isSuspended ? <SuspendedScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/"
          element={session ? (isAdmin ? <Navigate to="/admin" /> : (isSuspended ? <Navigate to="/suspended" /> : <Dashboard session={session} />)) : <Navigate to="/login" />}
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
