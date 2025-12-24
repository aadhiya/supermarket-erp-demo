import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';

import './App.css'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};
function App() {
  const [count, setCount] = useState(0)

  return (
      <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
              <ProtectedRoute>
                  <HomePage />
              </ProtectedRoute>
          } />
          <Route path="/products" element={
              <ProtectedRoute>
                  <ProductListPage />
              </ProtectedRoute>
          } />
      </Routes>
  )
}

export default App
