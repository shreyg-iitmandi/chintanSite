import React, { useState } from 'react';
import { UserRole, Product, User } from './types';
import Login from './components/Login';
import AdminView from './components/AdminView';
import UserView from './components/UserView';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([
    { username: 'user', password: 'password123' }
  ]);

  const handleLogout = () => {
    setUserRole(null);
  };
  
  const renderContent = () => {
    if (!userRole) {
      return <Login onLogin={setUserRole} users={users} />;
    }
    
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <header className="bg-gray-800 shadow-md p-4 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-xl font-bold">Shining Profits AI</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition"
          >
            Logout
          </button>
        </header>
        <main>
          {userRole === UserRole.ADMIN && <AdminView products={products} setProducts={setProducts} users={users} setUsers={setUsers} />}
          {userRole === UserRole.USER && <UserView products={products} />}
        </main>
      </div>
    );
  };

  return renderContent();
};

export default App;