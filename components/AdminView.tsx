import React, { useState, useRef } from 'react';
import { Product, User } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import TrashIcon from './icons/TrashIcon';

interface AdminViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({ products, setProducts, users, setUsers }) => {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPreview, setNewProductPreview] = useState<File | null>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  const handleAddProduct = async () => {
    if (newProductName.trim() === '' || !newProductPreview) {
        alert('Please provide a product name and a preview image.');
        return;
    }

    const previewImageUrl = await fileToBase64(newProductPreview);
    
    const newProduct: Product = {
      id: crypto.randomUUID(),
      name: newProductName.trim(),
      mockups: [],
      previewImageUrl,
    };
    setProducts(prev => [newProduct, ...prev]);
    setNewProductName('');
    setNewProductPreview(null);
    if (previewInputRef.current) {
        previewInputRef.current.value = '';
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAddMockups = async (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newMockupsPromises = Array.from(files).map(async (file) => {
      const dataUrl = await fileToBase64(file);
      return { id: crypto.randomUUID(), dataUrl, file };
    });
    
    const newMockups = await Promise.all(newMockupsPromises);

    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, mockups: [...p.mockups, ...newMockups] } : p
      )
    );
  };
  
  const handleDeleteMockup = (productId: string, mockupId: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, mockups: p.mockups.filter(m => m.id !== mockupId) }
          : p
      )
    );
  };
  
  const handleAddUser = () => {
    if (newUserName.trim() === '' || newUserPassword.trim() === '') {
      alert('Please provide a username and password.');
      return;
    }
    if (newUserName.trim().toLowerCase() === 'admin') {
      alert('Cannot create a user with the username "admin".');
      return;
    }
    if (users.some(u => u.username === newUserName.trim())) {
      alert('Username already exists.');
      return;
    }

    const newUser: User = {
      username: newUserName.trim(),
      password: newUserPassword.trim(),
    };
    setUsers(prev => [...prev, newUser]);
    setNewUserName('');
    setNewUserPassword('');
    alert(`User "${newUser.username}" created successfully!`);
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6">Admin Panel</h2>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <input
              type="text"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              placeholder="Enter product name"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div>
                 <label className="block mb-1 text-sm font-medium text-gray-300">Product Preview Image</label>
                 <input
                    ref={previewInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProductPreview(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                />
            </div>
        </div>
        <div className="mt-4">
            <button
              onClick={handleAddProduct}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition"
            >
              Add Product
            </button>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Manage Users</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="Enter new username"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <button
          onClick={handleAddUser}
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition"
        >
          Add User
        </button>

        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Existing Users</h4>
          {users.length > 0 ? (
            <ul className="list-disc list-inside text-gray-300">
              {users.map(user => (
                <li key={user.username}>{user.username}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No users created yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {products.map(product => (
          <div key={product.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex items-center gap-4">
                <img src={product.previewImageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-md"/>
                <h4 className="text-2xl font-bold">{product.name}</h4>
              </div>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                className="text-red-500 hover:text-red-400 transition flex-shrink-0"
              >
                <TrashIcon />
              </button>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Upload Mockups (with green screen)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddMockups(product.id, e.target.files)}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            {product.mockups.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {product.mockups.map(mockup => (
                        <div key={mockup.id} className="relative group">
                            <img src={mockup.dataUrl} alt="mockup" className="w-full h-full object-cover rounded-md aspect-square" />
                            <button onClick={() => handleDeleteMockup(product.id, mockup.id)} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {product.mockups.length === 0 && (
                <p className="mt-4 text-gray-500">No mockups uploaded for this product yet.</p>
            )}
          </div>
        ))}
        {products.length === 0 && (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
                <p className="text-gray-400">No products added yet. Add a new product to begin.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;