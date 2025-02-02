"use client"

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProducts } from '../redux/productSlice';

export default function HomePageWrapper({ children, products }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      dispatch(setProducts(products));
    }
  }, [dispatch, products]);

  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    return <div>Error loading products</div>;
  }

  return <>{children}</>;
}
