import { z } from 'zod';
import { ApiError } from './apiError';

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  description: z.string().min(10).max(1000),
  category: z.string(),
  type: z.string(),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0),
});

// User validation schema
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'customer', 'manager']).default('customer'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

// Order validation schema
export const orderSchema = z.object({
  userId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).default('pending'),
  shipping: z.number().min(0),
});

// Validate request body against a schema
export async function validateBody(req, schema) {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Validation Error', error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })));
    }
    throw error;
  }
}

// Validate query parameters against a schema
export function validateQuery(searchParams, schema) {
  try {
    const params = Object.fromEntries(searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw ApiError.badRequest('Invalid Query Parameters', error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      })));
    }
    throw error;
  }
}
