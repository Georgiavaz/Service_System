export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const handleApiError = (error: unknown) => {
  console.error("API Error:", error)

  if (error instanceof ApiError) {
    return {
      success: false,
      message: error.message,
      errors: error.errors,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message,
      statusCode: 500,
    }
  }

  return {
    success: false,
    message: "An unexpected error occurred",
    statusCode: 500,
  }
}

