import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  Box,
} from '@mui/material';
import { useCart } from '../context/CartContext.jsx';
import apiClient from '../api/client.js';
import { Link } from 'react-router-dom';  

const API_BASE = 'http://localhost:5261'; // your backend URL/port


const fetchProducts = async (category) => {
 // const res = await axios.get(`${API_BASE}/api/products`, {
   //   params: { category: category || undefined },
    const res = await apiClient.get('/api/products', { params: { category } });
  return res.data;
};

const ProductListPage = () => {
  const [category, setCategory] = useState('');
    const { addItem } = useCart();
    const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: () => fetchProducts(category),
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
      return <Alert severity="error">Failed to load products: {error.message}</Alert>;
    }
   
    // ✅ client-side filter by name
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

  return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" gutterBottom>Products</Typography>
      {/* ✅ NEW View Cart button */}
        <Button
          component={Link}
          to="/cart"
          variant="contained"
          color="success"
        >
          View Cart
        </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
      <TextField
        label="Filter by category"
        size="small"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
                  fullWidth
      />
      </Box>
      <Grid container spacing={2}>
        {products?.map((p) => (
          <Grid item xs={12} sm={6} md={3} key={p.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{p.name}</Typography>
                <Typography color="text.secondary">
                  {p.category || p.category}
                </Typography>
                <Typography variant="body1">
                            QAR {Number(p.price).toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                        <Button size="small" variant="contained"  fullWidth onClick={() => addItem(p)}>
                            Add to Cart
                        </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductListPage;
