import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import SuspendedScreen from './pages/SuspendedScreen';
import LandingPage from './pages/LandingPage';

import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';

import WelcomeTour from './components/WelcomeTour';

function App() {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Global Access for Dashboard/Settings
  useEffect(() => {
    window.solemiaOpenTour = () => setIsTourOpen(true);
    window.solemiaRestartTour = () => setIsTourOpen(true);
    return () => {
      delete window.solemiaOpenTour;
      delete window.solemiaRestartTour;
    };
  }, []);

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
            .select('*')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          // Solo suspendemos si is_active es explícitamente false
          setIsSuspended(tenantRecord?.is_active === false);

          // AUTO-TOUR logic moved to root
          if (tenantRecord && tenantRecord.has_seen_tour === false && !adminStatus) {
            setIsTourOpen(true);
          }
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
    <>
      <div id="solemia-app-root" style={{ pointerEvents: isTourOpen ? 'none' : 'auto' }}>
        <Router>
          <Routes>
            {/* Landing Page Pública */}
            <Route path="/" element={<LandingPage />} />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={!session ? <Login /> : (isAdmin ? <Navigate to="/admin" /> : (isSuspended ? <Navigate to="/suspended" /> : <Navigate to="/app" />))}
            />
            <Route
              path="/signup"
              element={!session ? <Signup /> : <Navigate to="/app" />}
            />

            {/* App Privada */}
            <Route
              path="/app"
              element={session ? (isAdmin ? <Navigate to="/admin" /> : (isSuspended ? <Navigate to="/suspended" /> : <Dashboard session={session} />)) : <Navigate to="/login" />}
            />

            <Route
              path="/suspended"
              element={session && isSuspended ? <SuspendedScreen /> : <Navigate to="/" />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={session ? (isAdmin ? <Admin session={session} /> : <Navigate to="/app" />) : <AdminLogin />}
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </div>

      <WelcomeTour
        isOpen={isTourOpen}
        onComplete={() => setIsTourOpen(false)}
      />
    </>
  );
}

export default App;
