import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; 

import './index.css'
import App from './App.jsx'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,     // 1 minute: good for product lists
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')).render( 
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                <CartProvider>
                <App />
                    </CartProvider>
                    </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
);