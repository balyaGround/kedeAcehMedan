// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './services/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Pages
import Kasir from "./pages/Kasir";
import Owner from './pages/Owner';

// Components
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode from URL
    const urlParams = new URLSearchParams(window.location.search);
    const demoMode = urlParams.get('demo');
    
    if (demoMode === 'true') {
      // Set demo user
      const demoUser = {
        uid: 'demo-user-123',
        email: 'demo@kedeaceh.com',
        displayName: 'Demo User',
        role: 'owner'
      };
      setUser(demoUser);
      setLoading(false);
      return;
    }

    // Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Try to get user role from Firestore
        getUserRole(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (firebaseUser) => {
    try {
      // Check if user exists in users collection
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', firebaseUser.email)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        // User exists, get role
        const userData = querySnapshot.docs[0].data();
        setUser({
          ...firebaseUser,
          role: userData.role || 'kasir'
        });
      } else {
        // New user, default to kasir
        await addDoc(collection(db, 'users'), {
          email: firebaseUser.email,
          role: 'kasir',
          createdAt: new Date()
        });
        setUser({
          ...firebaseUser,
          role: 'kasir'
        });
      }
    } catch (error) {
      console.error("Error getting user role:", error);
      // Default to kasir if error
      setUser({
        ...firebaseUser,
        role: 'kasir'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password, role) => {
    try {
      // Check for demo credentials
      if (email === 'owner@kedeaceh.com' && password === 'owner123') {
        const demoUser = {
          uid: 'demo-owner-123',
          email: email,
          displayName: 'Demo Owner',
          role: 'owner'
        };
        setUser(demoUser);
        return { success: true };
      }
      
      if (email === 'kasir@kedeaceh.com' && password === 'kasir123') {
        const demoUser = {
          uid: 'demo-kasir-123',
          email: email,
          displayName: 'Demo Kasir',
          role: 'kasir'
        };
        setUser(demoUser);
        return { success: true };
      }

      // Try Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check role or assign default
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      let userRole = 'kasir';
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        userRole = userData.role || 'kasir';
      } else {
        // Create new user record
        await addDoc(collection(db, 'users'), {
          email: email,
          role: role,
          createdAt: new Date()
        });
        userRole = role;
      }

      setUser({
        ...userCredential.user,
        role: userRole
      });
      
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.message || 'Login gagal. Periksa email dan password.' 
      };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Memuat sistem POS Kede Aceh...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route 
            path="/login" 
            element={
              !user ? (
                <Login onLogin={handleLogin} />
              ) : (
                <Navigate to={user.role === 'owner' ? '/owner' : '/kasir'} />
              )
            } 
          />
          
          <Route 
            path="/kasir" 
            element={
              user ? (
                <Kasir 
                  user={user} 
                  onLogout={handleLogout} 
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/owner" 
            element={
              user && (user.role === 'owner' || user.email === 'owner@kedeaceh.com' || user.email === 'demo@kedeaceh.com') ? (
                <Owner 
                  user={user} 
                  onLogout={handleLogout} 
                />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          
          <Route 
            path="/" 
            element={
              <Navigate to={user ? (user.role === 'owner' ? '/owner' : '/kasir') : '/login'} />
            } 
          />

          {/* Demo route */}
          <Route 
            path="/demo" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">KEDE ACEH DEMO</h1>
                    <p className="text-gray-600">Pilih role untuk masuk demo</p>
                  </div>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                        const demoUser = {
                          uid: 'demo-owner-123',
                          email: 'owner@kedeaceh.com',
                          displayName: 'Demo Owner',
                          role: 'owner'
                        };
                        setUser(demoUser);
                      }}
                      className="w-full p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="text-2xl mb-2">👑</div>
                      <div className="text-xl font-bold">Masuk sebagai Owner</div>
                      <div className="text-sm opacity-90 mt-1">Manajemen penuh sistem</div>
                    </button>
                    
                    <button
                      onClick={() => {
                        const demoUser = {
                          uid: 'demo-kasir-123',
                          email: 'kasir@kedeaceh.com',
                          displayName: 'Demo Kasir',
                          role: 'kasir'
                        };
                        setUser(demoUser);
                      }}
                      className="w-full p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      <div className="text-2xl mb-2">💼</div>
                      <div className="text-xl font-bold">Masuk sebagai Kasir</div>
                      <div className="text-sm opacity-90 mt-1">Transaksi dan penjualan</div>
                    </button>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-center text-sm text-gray-600">
                        Sistem POS Demo © 2024 Kede Aceh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;