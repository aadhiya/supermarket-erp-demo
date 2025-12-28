import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';

const fetchReorderSuggestions = () => apiClient.get('/api/orders/reorder-suggestions');
const fetchLastOrder = () => apiClient.get('/api/orders/last');

const ReorderPage = () => {
  const { addItem } = useCart();
  const [lastOrder, setLastOrder] = useState([]);

  const { data: suggestions = [], isLoading, error } = useQuery({
    queryKey: ['reorder-suggestions'],
    queryFn: fetchReorderSuggestions,
  });

  useEffect(() => {
    fetchLastOrder().then((res) => setLastOrder(res.data || []));
  }, []);

  const repeatLastOrder = async () => {
    try {
      const response = await apiClient.post('/api/orders/repeat', {
        items: lastOrder.map((item) => ({
          productCode: item.productCode,
          quantity: item.quantity,
        })),
      });
      alert(response.data.message || 'Order repeated!');
    } catch (err) {
      alert('Error repeating order');
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>🛒 Smart Reorder</Typography>

      {/* Repeat Last Order */}
      {lastOrder.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6">
              Repeat Last Order ({lastOrder.length} items)
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={repeatLastOrder}>
              1-Tap Repeat Last Order
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Reorder Suggestions */}
      <Typography variant="h5" gutterBottom>Suggested Reorders</Typography>
      {suggestions.length === 0 ? (
        <Alert severity="info">
          No reorder suggestions yet. Buy more products to see smart recommendations!
        </Alert>
      ) : (
        suggestions.map((suggestion, i) => (
          <Card key={i} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{suggestion.product?.name}</Typography>
              <Typography>QAR {suggestion.product?.price?.toFixed(2)}</Typography>
              <Chip label={`Every ${suggestion.weeks} weeks`} color="primary" />
              <Typography variant="body2">{suggestion.message}</Typography>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={() =>
                  addItem({
                    id: suggestion.productCode,
                    name: suggestion.product.name,
                    price: suggestion.product.price,
                    qty: 1,
                  })
                }
              >
                Add to Cart
              </Button>
            </CardActions>
          </Card>
        ))
      )}
    </Box>
  );
};

export default ReorderPage;
