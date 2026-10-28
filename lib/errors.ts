export const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong.";

export const apiErrorMessage = (error: unknown): string => {
  const response = (error as { response?: { data?: { error?: string } } })
    ?.response;
  return response?.data?.error || errorMessage(error);
};

export const apiErrorStatus = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;
