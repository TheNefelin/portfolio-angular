import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, inject, PLATFORM_ID, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GoogleAccounts } from '@core/models/auth-profile';
import { LoggerService } from '@core/services/logger-service';
import { ApiService } from './api-service';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
const GIS_LOAD_TIMEOUT_MS = 10000;

/**
 * Login con Google (Google Identity Services, GIS) en el navegador.
 *
 * Flujo: obtiene el client_id del BFF, carga el script de Google, abre el popup
 * y devuelve el access_token de Google. Ese token se envía después al BFF
 * (AuthService.loginGoogle), que lo cambia por la sesión en cookies HttpOnly.
 */
@Service()
export class AuthGoogleService {
  // SERVICES ---------------------------------------------------------------
  private readonly loggerService = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  // PLATFORM ---------------------------------------------------------------
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  // STATES -----------------------------------------------------------------
  // Promesas cacheadas: el script y el client_id se piden una sola vez.
  private scriptPromise: Promise<void> | null = null;
  private clientIdPromise: Promise<string> | null = null;

  // Precarga automática: se ejecuta una vez, en el navegador, tras el primer render.
  // Así el popup sale rápido al hacer clic y el navegador no lo bloquea.
  private readonly warmUp = afterNextRender(() => this.preload());

  // ------------------------------------------------------------------------
  // API PÚBLICA
  // ------------------------------------------------------------------------

  /**
   * Abre el popup de Google y devuelve el access_token.
   * Si el client_id o el script aún no están cargados, los espera.
   * Rechaza con un Error cuyo mensaje es el tipo de fallo
   * (por ejemplo 'popup_closed' si el usuario cierra la ventana).
   */
  async getAccessToken(): Promise<string> {
    const [clientId] = await Promise.all([this.getClientId(), this.ensureGisLoaded()]);

    return new Promise((resolve, reject) => {
      const oauth2 = this.readGoogle()?.accounts?.oauth2;
      if (!oauth2?.initTokenClient) {
        reject(new Error('Google OAuth2 no disponible'));
        return;
      }

      const client = oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: (response) => {
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error(response.error || 'No se recibió access_token'));
          }
        },
        // GIS entrega { type: 'popup_closed' | 'popup_failed_to_open' | ... }, no un Error.
        error_callback: (error) => {
          reject(new Error((error as { type?: string } | null)?.type ?? 'unknown'));
        },
      });

      client.requestAccessToken();
    });
  }

  /**
   * Precarga el client_id y el script de Google, sin esperar resultado.
   * Los fallos se ignoran aquí: getAccessToken() volverá a intentarlo al hacer clic.
   */
  preload(): void {
    if (!this.isBrowser) return;
    void Promise.all([this.getClientId(), this.ensureGisLoaded()]).catch(() => undefined);
  }

  // ------------------------------------------------------------------------
  // CLIENT ID
  // ------------------------------------------------------------------------

  /**
   * client_id público de Google, servido por el BFF (GET /ssr-api/config).
   * Se pide una sola vez; si falla, se descarta la promesa para permitir reintento.
   */
  private getClientId(): Promise<string> {
    this.clientIdPromise ??= firstValueFrom(
      this.apiService.get<{ googleClientId: string }>('config'),
    )
      .then((config) => config.googleClientId)
      .catch((error: unknown) => {
        this.clientIdPromise = null;
        throw error;
      });

    return this.clientIdPromise;
  }

  // ------------------------------------------------------------------------
  // CARGA DEL SCRIPT DE GOOGLE
  // ------------------------------------------------------------------------

  /**
   * Garantiza que el script de GIS esté cargado (idempotente).
   * Rechaza si se llama en el servidor, si hay error de red o si pasa el timeout.
   */
  private ensureGisLoaded(): Promise<void> {
    if (!this.isBrowser) {
      return Promise.reject(new Error('Google OAuth2 solo está disponible en el navegador'));
    }

    this.scriptPromise ??= this.withTimeout(this.loadGisScript(), GIS_LOAD_TIMEOUT_MS)
      .catch((error: unknown) => {
        // Permite reintento en la próxima llamada tras un fallo transitorio.
        this.scriptPromise = null;
        this.loggerService.error('AuthGoogleService', 'No se pudo cargar Google Identity Services', error);
        throw error;
      });

    return this.scriptPromise;
  }

  /** Inserta el <script> de Google en el documento y espera a que inicialice window.google. */
  private loadGisScript(): Promise<void> {
    // Si ya estaba cargado por una ejecución anterior, resuelve al instante.
    if (this.readGoogle()?.accounts?.oauth2) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (this.readGoogle()?.accounts?.oauth2) {
          resolve();
        } else {
          script.remove();
          reject(new Error('GIS se cargó pero no inicializó window.google'));
        }
      };
      script.onerror = () => {
        script.remove();
        reject(new Error('No se pudo cargar Google Identity Services (red o CSP)'));
      };

      document.head.appendChild(script);
    });
  }

  // ------------------------------------------------------------------------
  // UTILIDADES
  // ------------------------------------------------------------------------

  /** Lee window.google de forma segura (undefined en el servidor o si el script no cargó). */
  private readGoogle(): { accounts?: GoogleAccounts } | undefined {
    if (!this.isBrowser) return undefined;
    return (window as unknown as { google?: { accounts?: GoogleAccounts } }).google;
  }

  /** Rechaza la promesa si no se resuelve antes de `ms` milisegundos. */
  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('Google Identity Services no se cargó después de 10 segundos. Revisa red/CSP')),
        ms,
      );
      promise.then(
        (value) => { clearTimeout(timer); resolve(value); },
        (error) => { clearTimeout(timer); reject(error); },
      );
    });
  }
}
