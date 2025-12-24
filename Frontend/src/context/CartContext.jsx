import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });

    //  Debounced save to localStorage (better performance)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            try {
                localStorage.setItem('cart', JSON.stringify(cart));
            } catch (e) {
                console.warn('Failed to save cart to localStorage:', e);
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [cart]);

    const addItem = useCallback((product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
        });
    }, []);
    // ✅ Additional cart functions for completeness
    const removeItem = useCallback((id) => {
        setCart(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateQty = useCallback((id, qty) => {
        setCart(prev =>
            prev.map(item =>
                item.id === id ? { ...item, qty: Math.max(1, qty) } : item
            )
        );
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const value = {
        cart,
        setCart,
        addItem,
        removeItem,
        updateQty,
        clearCart
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
