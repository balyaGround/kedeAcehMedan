// src/components/Login.jsx
import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('kasir');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo credentials
  const demoCredentials = {
    owner: { 
      email: 'owner@kedeaceh.com', 
      password: 'owner123',
      label: 'Owner'
    },
    kasir: { 
      email: 'kasir@kedeaceh.com', 
      password: 'kasir123',
      label: 'Kasir'
    }
  };

  // Handle role selection dengan auto-fill credentials
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    // Auto-fill email dan password sesuai role yang dipilih
    setEmail(demoCredentials[selectedRole].email);
    setPassword(demoCredentials[selectedRole].password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Cek apakah menggunakan demo credentials
      const isDemoOwner = email === demoCredentials.owner.email && password === demoCredentials.owner.password;
      const isDemoKasir = email === demoCredentials.kasir.email && password === demoCredentials.kasir.password;
      
      // Validasi role sesuai dengan credentials
      if (role === 'owner' && !isDemoOwner) {
        setError('Email/password tidak sesuai dengan role Owner. Gunakan owner@kedeaceh.com / owner123');
        setLoading(false);
        return;
      }
      
      if (role === 'kasir' && !isDemoKasir) {
        setError('Email/password tidak sesuai dengan role Kasir. Gunakan kasir@kedeaceh.com / kasir123');
        setLoading(false);
        return;
      }

      // Panggil onLogin dari props
      const result = await onLogin(email, password, role);
      
      if (!result.success) {
        setError(result.error || 'Login gagal. Coba lagi.');
      }
    } catch (error) {
      setError('Terjadi kesalahan. Coba lagi.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">KEDE ACEH</h1>
          <p className="text-gray-600">Sistem POS Grosiran Medan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Role Selection dengan Auto-fill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Role Login
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'owner', label: 'Owner', icon: '👑' },
                { id: 'kasir', label: 'Kasir', icon: '💼' }
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleRoleSelect(option.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                    role === option.id
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  {role === option.id && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="text-3xl mb-2">{option.icon}</div>
                  <div className="font-bold text-gray-800">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Info Role yang Dipilih */}
          {role && (
            <div className={`p-3 rounded-lg ${
              role === 'owner' ? 'bg-purple-50 border border-purple-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{role === 'owner' ? '👑' : '💼'}</span>
                <div>
                  <p className={`text-sm font-medium ${
                    role === 'owner' ? 'text-purple-700' : 'text-green-700'
                  }`}>
                    Login sebagai {role === 'owner' ? 'Owner' : 'Kasir'}
                  </p>
                  <p className="text-xs text-gray-600">
                    Email: {demoCredentials[role].email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="email@kedeaceh.com"
                required
              />
              {email === demoCredentials[role]?.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                placeholder="••••••••"
                required
              />
              {password === demoCredentials[role]?.password && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">🔑 Demo Credentials:</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">👑 Owner</span>
                  <code className="bg-purple-100 px-2 py-1 rounded text-purple-700 text-xs">owner@kedeaceh.com</code>
                </div>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">owner123</code>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">💼 Kasir</span>
                  <code className="bg-green-100 px-2 py-1 rounded text-green-700 text-xs">kasir@kedeaceh.com</code>
                </div>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">kasir123</code>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] ${
              role === 'owner'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
            } text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memproses...</span>
              </div>
            ) : (
              `Login sebagai ${role === 'owner' ? 'Owner' : 'Kasir'}`
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600">
            © 2024 Kede Aceh - Sistem POS Grosiran Medan
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;