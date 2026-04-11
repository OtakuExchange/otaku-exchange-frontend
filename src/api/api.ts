export const API_URL = import.meta.env.VITE_API_URL;

export type GetToken = () => Promise<string | null>;

export async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
