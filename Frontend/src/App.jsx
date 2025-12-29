// Frontend/src/App.jsx - COMPLETE WORKING VERSION:
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import CartPage from './pages/CartPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import { useNavigate } from 'react-router-dom';
import ReorderPage from './pages/ReorderPage.jsx';
import './App.css';

// ✅ DEFINE HOMEPAGE HERE:
const HomePage = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        // Clear client-side session data
        localStorage.removeItem('token');      // if your useAuth doesn't already do this
        localStorage.removeItem('cart');       // clear cart
        localStorage.removeItem('user');       // optional, if you store it
        logout();
        navigate('/login');   // or '/' if you prefer
    };

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
                {isAuthenticated && (
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'inline-block',
                            margin: '0.5rem',
                            padding: '1rem 2rem',
                            background: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        🚪 Logout
                    </button>
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
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

//const LoginPage = () => <div>Login Page (create later)</div>;  // ✅ TEMP

function App() {
    return (
        
            <Routes>
                <Route path="/" element={<HomePage />} />           {/* ✅ NOW WORKS */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/products" element={<ProductListPage />} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/reorder" element={<ProtectedRoute><ReorderPage /></ProtectedRoute>} /> 
            </Routes>
        
    );
}

export default App;
