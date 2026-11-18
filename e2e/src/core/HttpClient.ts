import type { APIRequestContext } from '@playwright/test';
import { Logger } from './Logger';
import { TafError } from './TafError';

// Core / Adaptation Layer: a wrapper over Playwright APIRequestContext.
// Logs every request and response, hides passwords, catches network errors.
export interface HttpResponse {
  status: number;
  body: string;
  json<T = unknown>(): T;
}

interface SendOptions {
  data?: unknown;
  form?: Record<string, string>;
  headers?: Record<string, string>;
}

const SECRET_KEYS = ['password', 'csrfToken'];
const MAX_BODY_IN_LOG = 500;

export class HttpClient {
  constructor(private readonly ctx: APIRequestContext, private readonly log: Logger) {}

  async send(method: string, url: string, options: SendOptions = {}): Promise<HttpResponse> {
    const payload = options.data ?? options.form;
    this.log.info(`→ ${method} ${url}${payload ? ' ' + JSON.stringify(mask(payload)) : ''}`);
    const started = Date.now();

    try {
      const res = await this.ctx.fetch(url, {
        method,
        data: options.data,
        form: options.form,
        headers: options.headers,
        failOnStatusCode: false, // the status is checked by the test, not by the client
      });
      const body = await res.text();
      this.log.info(`← ${res.status()} ${method} ${url} (${Date.now() - started} ms) ${cut(body)}`);
      return {
        status: res.status(),
        body,
        json: <T>() => parseJson<T>(body, url),
      };
    } catch (e) {
      this.log.error(`✗ ${method} ${url}: ${(e as Error).message}`);
      throw new TafError(`Request ${method} ${url} failed`, e);
    }
  }
}

function mask(payload: unknown): unknown {
  if (typeof payload !== 'object' || payload === null) return payload;
  return Object.fromEntries(
    Object.entries(payload).map(([k, v]) => [k, SECRET_KEYS.includes(k) ? '***' : v]),
  );
}

function cut(body: string): string {
  return body.length > MAX_BODY_IN_LOG ? body.slice(0, MAX_BODY_IN_LOG) + '…' : body;
}

function parseJson<T>(body: string, url: string): T {
  try {
    return JSON.parse(body) as T;
  } catch (e) {
    throw new TafError(`Response from ${url} is not JSON`, e);
  }
}
