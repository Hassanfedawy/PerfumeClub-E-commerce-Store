'use client';

import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { addToCart, removeFromCart, updateQuantity } from '../../redux/cartSlice';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CartPage() {
  const cart = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
  };

  const handleRemoveItem = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingCost = subtotal > 200 ? 0 : 15;
  const total = subtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some luxurious fragrances to your cart!</p>
          <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center sm:text-left">Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            {cart.map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row items-center p-6 border border-gray-200 rounded-lg bg-white">
                <Image src={item.image} alt={item.alt} width={300} height={300} className="h-24 w-24 object-cover rounded-md" />
                <div className="sm:ml-6 mt-4 sm:mt-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                  <p className="text-lg font-medium text-gray-900 mt-2">${(item.price * item.quantity).toFixed(2)}</p>
                  <div className="flex items-center justify-between mt-4 w-full">
                    <div className="flex items-center border rounded-md">
                      <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2 hover:bg-gray-100">-</button>
                      <span className="px-4 py-2 border-x">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2 hover:bg-gray-100">+</button>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-sm font-medium text-red-600 hover:text-red-500">
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            <Link href="/" className="text-purple-600 hover:text-purple-700 font-medium block text-center sm:text-left">
              ← Continue Shopping
            </Link>
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="text-gray-900">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="text-gray-900">{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span></div>
                {shippingCost > 0 && <p className="text-sm text-gray-500">Free shipping on orders over $200</p>}
                <div className="border-t pt-4 flex justify-between"><span className="text-lg font-medium text-gray-900">Total</span><span className="text-lg font-medium text-gray-900">${total.toFixed(2)}</span></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => router.push('/Checkout')} className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 transition-colors duration-200">
                  Proceed to Checkout
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
