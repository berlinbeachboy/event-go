import React, { useState } from 'react';
import axios from '../axiosConfig';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nickname: '',
    fullName: '',
    phone: '',
    sitePasswort: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Axios POST request
      const response = await axios.post('/register', formData);
      if (response.status === 201) {
        alert('Subbbi, des hat klappt!');
        setFormData({ username: '', password: '', nickname: '', fullName: '', phone: '' , sitePasswort: ''});
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Irgendwas scheint noch nicht zu stimmen. :/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm border">
      <div>
        <label className="block text-gray-700">Email</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Dein Passwort</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Spitzname</label>
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Vor- und Nachname</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-gray-700">Handynummer (für Whatsapp-Gruppe wer will)</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">Passwort der Seite (bitte bei Admins erfragen)</label>
        <input
          type="text"
          name="sitePassword"
          value={formData.sitePasswort}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <br></br>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded w-full"
      >
        Aufi geht's!
      </button>
    </form>
  );
}
