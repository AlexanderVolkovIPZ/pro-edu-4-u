import { HttpClient } from '../../core/HttpClient';

export interface Credentials {
  email: string;
  password: string;
}

// Sign-in through NextAuth (credentials) without the UI:
// 1) get the CSRF token, 2) submit the form, 3) check the session.
export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  async login(c: Credentials): Promise<boolean> {
    const csrf = await this.http.send('GET', '/api/auth/csrf');
    const { csrfToken } = csrf.json<{ csrfToken: string }>();

    await this.http.send('POST', '/api/auth/callback/credentials', {
      form: { csrfToken, email: c.email, password: c.password, json: 'true' },
    });

    const session = await this.http.send('GET', '/api/auth/session');
    const user = session.json<{ user?: { email?: string } } | null>()?.user;
    return user?.email?.toLowerCase() === c.email.toLowerCase();
  }
}
