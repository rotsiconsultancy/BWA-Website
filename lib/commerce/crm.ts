type CrmResult<T> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message?: string };
};

export async function sendToCrm<T>(
  path: string,
  body: unknown,
  idempotencyKey: string,
): Promise<CrmResult<T>> {
  const baseUrl = process.env.CRM_API_BASE_URL;
  const secret = process.env.CRM_API_SECRET_KEY;
  if (!baseUrl || !secret)
    return {
      success: false,
      error: {
        code: "CRM_NOT_CONFIGURED",
        message: "CRM sync is not configured.",
      },
    };
  try {
    const response = await fetch(new URL(path, baseUrl), {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secret,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    return response.ok
      ? { success: true, data: payload.data as T }
      : {
          success: false,
          error: payload.error ?? {
            code: "CRM_ERROR",
            message: "CRM sync failed.",
          },
        };
  } catch {
    return {
      success: false,
      error: {
        code: "CRM_UNREACHABLE",
        message: "CRM sync could not be reached.",
      },
    };
  }
}
