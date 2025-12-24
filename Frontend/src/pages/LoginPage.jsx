// Frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import apiClient from '../api/client.js';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/products');
        } else {
            setError(result.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <Box sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
            <Typography variant="h4" gutterBottom>Login</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 2 }}>
                Demo: customer@test.com / 123
            </Typography>
        </Box>
    );
};

export default LoginPage;
