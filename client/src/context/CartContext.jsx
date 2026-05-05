import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart || { items: [] });
    } catch (_) {
      setCart({ items: [] });
    }
  }, []);

  useEffect(() => { 
    if (!user) {
      // Clear cart locally immediately on logout, before fetching guest cart
      setCart({ items: [] });
    }
    fetchCart(); 
  }, [user, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error('Please login to add items to your cart ', {
        icon: '',
        style: { borderRadius: '10px', background: '#333', color: '#fff' }
      });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/cart', { productId, quantity, action: 'add' });
      setCart(res.data.cart);
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add to cart');
    } finally { setLoading(false); }
  };

  const removeFromCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart', { productId, quantity, action: 'remove' });
      setCart(res.data.cart);
    } catch (_) {}
  };

  const setQuantity = async (productId, quantity) => {
    try {
      const res = await api.post('/cart', { productId, quantity, action: 'set' });
      setCart(res.data.cart);
    } catch (_) {}
  };

  const deleteItem = async (productId) => {
    try {
      const res = await api.post('/cart', { productId, action: 'delete' });
      setCart(res.data.cart);
    } catch (_) {}
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart({ items: [] });
    } catch (_) {}
  };

  const cartCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const cartTotal = cart.items?.reduce((sum, i) => {
    const p = i.productId;
    const price = p?.salePrice || p?.price || 0;
    return sum + price * i.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, loading, addToCart, removeFromCart, setQuantity, deleteItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
