import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load Cart from LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('aura_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed");
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: newQty } : item))
    );
  };

  // --- CRITICAL FIX: Define clearCart ---
  const clearCart = () => {
    setCart([]); // Empty the state
    localStorage.removeItem('aura_cart'); // Clear local storage
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart, // <--- Exporting it here so CheckoutModal can use it
    cartTotal,
    cartItems: cart // Alias for Navbar count
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}