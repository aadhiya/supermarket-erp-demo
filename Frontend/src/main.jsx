import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

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

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                <CartProvider>
                <App />
                    </CartProvider>
                    </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);