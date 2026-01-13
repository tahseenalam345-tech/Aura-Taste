import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Load cart from LocalStorage so data isn't lost on refresh
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('aura-cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to LocalStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('aura-cart', JSON.stringify(cart));
  }, [cart]);

  // Add Item Function
  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // If item exists, just increase quantity
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item
        );
      }
      // If new item, add to array
      return [...prev, { ...product, qty: quantity }];
    });
  };

  // Remove Item Function
  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
// Decrease Item Quantity
  const decreaseQuantity = (id) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      }).filter(item => item.qty > 0); // Remove item if quantity becomes 0
    });
  };
  // Calculate Total Price
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
   <CartContext.Provider value={{ cart, addToCart, removeFromCart, decreaseQuantity, total, setCart }}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => useContext(CartContext);
