import type { AuthTokens, LoginCredentials } from "@/types";
import { API_URL } from "./constants";
import axios from "axios";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Add 10 second buffer
    return payload.exp * 1000 < Date.now() - 10000;
  } catch {
    return true;
  }
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthTokens> {
  const { data } = await axios.post<AuthTokens>(
    `${API_URL}/auth/token/`,
    credentials
  );
  setTokens(data.access, data.refresh);
  return data;
}

export async function refreshAccessToken(): Promise<string> {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
    refresh,
  });
  setTokens(data.access, data.refresh || refresh);
  return data.access;
}
