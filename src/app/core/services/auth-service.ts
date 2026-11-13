import { Service } from '@angular/core';
import { environment } from '@environments/environment';

export interface AuthUser {
  id_user: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
}

export interface AuthSession {
  token: string;
  refresh_token: string;
  user: AuthUser;
}

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GOOGLE_SCRIPT_TIMEOUT_MS = 10_000;

// El BFF quita el prefijo /ssr-api y reenvia el resto a la API (/api/auth/...).
// El endpoint del frontend NO lleva /api: el BFF anade el prefijo API_URL (que
// ya incluye /api) al reenviar. Si se pone /api aqui, el backend recibe
// /api/api/auth/... y devuelve 404.
const AUTH_ENDPOINT = '/ssr-api/auth';

const STORAGE_TOKEN = 'auth.access_token';
const STORAGE_REFRESH = 'auth.refresh_token';
const STORAGE_USER = 'auth.user';

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    let timeout = 0;

    const fail = (message: string) => {
      clearTimeout(timeout);
      script.remove();
      reject(new Error(message));
    };

    timeout = window.setTimeout(
      () => fail('Tiempo de espera agotado cargando el script de Google'),
      GOOGLE_SCRIPT_TIMEOUT_MS,
    );

    script.src = GOOGLE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => fail('No se pudo cargar el script de Google');
    document.head.appendChild(script);
  });
}

@Service()
export class AuthService {
  // undefined = sin hidratar; sessionStorage se lee una sola vez.
  private session: AuthSession | null | undefined;

  getAccessToken(): string | null {
    return this.getSession()?.token ?? null;
  }

  async loginWithGoogle(): Promise<void> {
    const clientId = environment.googleClientId;

    if (!clientId) {
      throw new Error('Google login no configurado: falta environment.googleClientId');
    }

    await loadGoogleScript();

    if (!window.google) {
      throw new Error('El script de Google no está disponible');
    }

    return new Promise<void>((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (response) => {
          if (!response.access_token || response.error) {
            reject(new Error(response.error ?? 'Error al autenticar con Google'));
            return;
          }

          this.exchangeGoogleToken(response.access_token).then(resolve, reject);
        },
      });

      client.requestAccessToken();
    });
  }

  async refresh(): Promise<string | null> {
    const session = this.getSession();
    if (!session?.refresh_token) return null;

    try {
      const res = await fetch(`${AUTH_ENDPOINT}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });

      if (!res.ok) {
        this.clearSession();
        return null;
      }

      const data = (await res.json()) as { token: string; refresh_token: string };
      this.setSession({ token: data.token, refresh_token: data.refresh_token, user: session.user });
      return data.token;
    } catch {
      this.clearSession();
      return null;
    }
  }

  async logout(): Promise<void> {
    const session = this.getSession();

    if (session?.refresh_token) {
      try {
        await fetch(`${AUTH_ENDPOINT}/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: session.refresh_token }),
        });
      } catch {
        // El logout remoto puede fallar; la sesión local se limpia igual.
      }
    }

    this.clearSession();
  }

  private async exchangeGoogleToken(googleToken: string): Promise<void> {
    const res = await fetch(`${AUTH_ENDPOINT}/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleToken }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { detail?: unknown } | null;
      const detail = body?.detail;
      throw new Error(typeof detail === 'string' ? detail : 'Error al autenticar con Google');
    }

    this.setSession((await res.json()) as AuthSession);
  }

  private getSession(): AuthSession | null {
    if (this.session === undefined) {
      this.session = this.readSession();
    }

    return this.session;
  }

  private readSession(): AuthSession | null {
    if (typeof sessionStorage === 'undefined') return null;

    const token = sessionStorage.getItem(STORAGE_TOKEN);
    const refreshToken = sessionStorage.getItem(STORAGE_REFRESH);
    const user = sessionStorage.getItem(STORAGE_USER);

    if (!token || !user) return null;

    try {
      return { token, refresh_token: refreshToken ?? '', user: JSON.parse(user) as AuthUser };
    } catch {
      return null;
    }
  }

  private setSession(session: AuthSession): void {
    this.session = session;
    if (typeof sessionStorage === 'undefined') return;

    sessionStorage.setItem(STORAGE_TOKEN, session.token);
    sessionStorage.setItem(STORAGE_REFRESH, session.refresh_token);
    sessionStorage.setItem(STORAGE_USER, JSON.stringify(session.user));
  }

  private clearSession(): void {
    this.session = null;
    if (typeof sessionStorage === 'undefined') return;

    sessionStorage.removeItem(STORAGE_TOKEN);
    sessionStorage.removeItem(STORAGE_REFRESH);
    sessionStorage.removeItem(STORAGE_USER);
  }
}
