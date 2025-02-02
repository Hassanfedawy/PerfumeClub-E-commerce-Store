import { NextResponse } from 'next/server';
import { ApiError, handleApiError } from '@/lib/apiError';
import { getToken } from 'next-auth/jwt';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      throw ApiError.unauthorized();
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      throw ApiError.badRequest('No file provided');
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer);

    // Return the URL and public_id of the uploaded image
    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request) {
  try {
    // Check authentication
    const token = await getToken({ req: request });
    if (!token) {
      throw ApiError.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      throw ApiError.badRequest('No public_id provided');
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(publicId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
