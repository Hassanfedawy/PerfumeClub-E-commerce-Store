import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addToCart: (state, action) => {
      // Ensure we only store serializable data
      const { createdAt, updatedAt, ...serializableData } = action.payload;
      
      const existingItem = state.find(item => 
        item.id === serializableData.id
      );
      
      if (existingItem) {
        existingItem.quantity += serializableData.quantity || 1;
      } else {
        state.push({
          ...serializableData,
          quantity: serializableData.quantity || 1
        });
      }
    },
    removeFromCart: (state, action) => {
      return state.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.find(item => item.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      return [];
    }
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;