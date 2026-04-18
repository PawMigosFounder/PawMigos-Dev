// Typed API client for the PawMigos Next.js backend.
// Automatically attaches JWT from secure storage as Authorization: Bearer.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { loadToken } from './session';
import type { ApiResponse } from './types';

function resolveBaseUrl(): string {
  const fromConfig = (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl;
  if (fromConfig && !fromConfig.includes('localhost')) return fromConfig;

  // Dev: on iOS simulator localhost works, on Android emulator use 10.0.2.2,
  // on a physical device the value is derived from the Metro host IP.
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';

  // For physical devices via Expo Go, infer the host IP the bundle was served from.
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.developer?.host ||
    '';
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';
  if (host && host !== 'localhost') return `http://${host}:3000`;

  return fromConfig || 'http://localhost:3000';
}

const BASE_URL = resolveBaseUrl();

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const { body, headers, skipAuth, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    const token = await loadToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...rest,
      headers: finalHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as ApiResponse<T>;

    if (!res.ok && !('success' in json)) {
      return {
        success: false,
        error: (json as any)?.error || `Request failed (${res.status})`,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Network error. Please check your connection.',
    };
  }
}

export const api = {
  get: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T = unknown>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T = unknown>(path: string, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};

export const API_BASE_URL = BASE_URL;
