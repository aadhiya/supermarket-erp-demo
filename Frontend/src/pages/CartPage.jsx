// Frontend/src/pages/CartPage.jsx
import React from 'react';
import { useCart } from '../context/CartContext.jsx';
import {
    Box,
    Typography,
    Button,
    Divider,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
    const { cart, setCart } = useCart();   // assumes CartContext exposes setCart
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        setCart(updated);
    };

    const updateQty = (id, delta) => {
        const updated = cart
            .map(item =>
                item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
            );
        setCart(updated);
    };

    const handleCheckout = () => {
        // later: call backend /api/orders
        navigate('/checkout');
    };

    if (!cart.length) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>Your Cart</Typography>
                <Typography sx={{ mb: 2 }}>Your cart is empty.</Typography>
                <Button component={Link} to="/products" variant="contained">
                    Go to Products
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Your Cart</Typography>
            <Divider sx={{ mb: 2 }} />

            {cart.map(item => (
                <Box
                    key={item.id}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                    }}
                >
                    <Box>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            QAR {item.price.toFixed(2)} × {item.qty}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => updateQty(item.id, -1)}
                        >
                            −
                        </Button>
                        <Typography>{item.qty}</Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => updateQty(item.id, +1)}
                        >
                            +
                        </Button>
                        <Typography sx={{ width: 90, textAlign: 'right' }}>
                            QAR {(item.price * item.qty).toFixed(2)}
                        </Typography>
                        <IconButton color="error" onClick={() => removeItem(item.id)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
                Total: QAR {total.toFixed(2)}
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={handleCheckout}
                sx={{ mr: 2 }}
            >
                Proceed to Checkout
            </Button>
            <Button component={Link} to="/products">Continue Shopping</Button>
        </Box>
    );
};

export default CartPage;
