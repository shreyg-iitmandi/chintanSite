import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Admin login remains special
    if (username === 'admin' && password === 'password123') {
      onLogin(UserRole.ADMIN);
      return;
    }
    
    // Check against the dynamic list of users
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      onLogin(UserRole.USER);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md text-center p-8 bg-gray-800 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-bold text-white mb-2">Shining Profits AI</h1>
        <p className="text-lg text-gray-400 mb-8">Product Image Generator</p>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Username"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
            disabled={!username || !password}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;