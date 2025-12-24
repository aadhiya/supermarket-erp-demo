// Frontend/src/App.jsx - COMPLETE WORKING VERSION:
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import CartPage from './pages/CartPage.jsx';
import './App.css';

// ✅ DEFINE HOMEPAGE HERE:
const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>🛒 Supermarket ERP</h1>
            <p>Welcome to your full-stack supermarket app with JWT auth!</p>

            <div style={{ margin: '2rem 0' }}>
                <Link to="/products" style={{
                    display: 'inline-block',
                    margin: '0.5rem',
                    padding: '1rem 2rem',
                    background: '#1976d2',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px'
                }}>
                    🛍️ Shop Products
                </Link>

                {isAuthenticated ? (
                    <Link to="/cart" style={{
                        display: 'inline-block',
                        margin: '0.5rem',
                        padding: '1rem 2rem',
                        background: '#4caf50',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px'
                    }}>
                        🛒 View Cart
                    </Link>
                ) : (
                    <Link to="/login" style={{
                        display: 'inline-block',
                        margin: '0.5rem',
                        padding: '1rem 2rem',
                        background: '#ff9800',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '4px'
                    }}>
                        🔐 Login
                    </Link>
                )}
            </div>

            {user && (
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '4px' }}>
                    <strong>Logged in as:</strong> {user.email}
                </div>
            )}
        </div>
    );
};

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const LoginPage = () => <div>Login Page (create later)</div>;  // ✅ TEMP

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />           {/* ✅ NOW WORKS */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
