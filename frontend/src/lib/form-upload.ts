const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type FormUploadOptions = {
  token?: string | null;
  redirectOnAuthError?: string;
};

export async function submitForm<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  formData: FormData,
  options: FormUploadOptions = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if ((res.status === 401 || res.status === 403) && options.redirectOnAuthError && typeof window !== "undefined") {
    window.location.href = options.redirectOnAuthError;
  }

  if (!res.ok) {
    throw new Error((data as { message?: string }).message || `Upload failed (${res.status})`);
  }

  return data as T;
}

export const imageAccept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

export const logoAccept = `${imageAccept},image/svg+xml,.svg`;

export function previewFile(file: File | null, onPreview: (url: string | null) => void) {
  if (!file) {
    onPreview(null);
    return;
  }
  onPreview(URL.createObjectURL(file));
}
