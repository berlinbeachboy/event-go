import React, { useState } from 'react';
import axios from '../axiosConfig';

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/login', formData);
      onLogin();
    } catch (error) {
      alert('Invalid login credentials!');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm border"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-700 text-center">Login</h2>
      <div className="mb-4">
        <label className="block text-gray-700">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-700"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded text-gray-700"
          required
        />
      </div>
      <button
        type="submit"
        className="bg-green-500 text-white py-2 px-4 rounded w-full"
      >
        Login
      </button>
    </form>
  );
}