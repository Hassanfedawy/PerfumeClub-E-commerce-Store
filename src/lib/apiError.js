export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized', errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Forbidden', errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Not Found', errors = []) {
    return new ApiError(404, message, errors);
  }

  static tooManyRequests(message = 'Too Many Requests', errors = []) {
    return new ApiError(429, message, errors);
  }

  static internal(message = 'Internal Server Error', errors = []) {
    return new ApiError(500, message, errors);
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        message: error.message,
        errors: error.errors,
      }),
      {
        status: error.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Handle Prisma errors
  if (error.code) {
    switch (error.code) {
      case 'P2002':
        return new Response(
          JSON.stringify({
            message: 'Unique constraint violation',
            errors: [{ field: error.meta?.target?.[0], message: 'Already exists' }],
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      case 'P2025':
        return new Response(
          JSON.stringify({
            message: 'Record not found',
            errors: [],
          }),
          {
            status: 404,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
    }
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return new Response(
      JSON.stringify({
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Default error response
  return new Response(
    JSON.stringify({
      message: 'Internal Server Error',
      errors: [],
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
};
