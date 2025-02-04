"use client"
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProducts } from '../redux/productSlice';

export default function HomePageWrapper({ children, products }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      // Convert Date objects to ISO strings
      const serializedProducts = products.map(product => ({
        ...product,
        createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
        updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
      }));
      
      dispatch(setProducts(serializedProducts));
    }
  }, [dispatch, products]);

  if (!Array.isArray(products)) {
    console.error('Products is not an array:', products);
    return <div>Error loading products</div>;
  }

  return <>{children}</>;
}
