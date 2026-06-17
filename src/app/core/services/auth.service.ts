import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { environment } from 'src/environments/environment';

import type { AuthResponse } from '../models/auth.model';
import type { Ninja, NinjaRank } from '../models/ninja.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private ninjaSubject = new BehaviorSubject<Ninja | null>(null);

  ninja$ = this.ninjaSubject.asObservable();

  get currentNinja(): Ninja | null {
    return this.ninjaSubject.value;
  }

  get currentToken(): string | null {
    return this.token;
  }

  get isLogged(): boolean {
    return !!this.token;
  }

  constructor(private http: HttpClient) {}

  async initSession(): Promise<void> {
    const { value: token } = await Preferences.get({ key: 'token' });
    const { value: ninjaStr } = await Preferences.get({ key: 'ninja' });

    this.token = token ?? null;

    const parsed = ninjaStr ? (JSON.parse(ninjaStr) as Ninja) : null;
    this.ninjaSubject.next(this.normalizeNinja(parsed));
  }

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { username, password })
    );

    await this.setSession(res.token, res.ninja);
  }

  async register(username: string, password: string, rank: NinjaRank): Promise<void> {
  const apiRank: 'Genin' | 'Chunin' | 'Jonin' =
    rank === 'Hokage' || rank === 'ANBU' ? 'Jonin' : rank;

  const res = await firstValueFrom(
    this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
      username,
      password,
      rank: apiRank,
    })
  );

  const ninjaFixed: Ninja = { ...res.ninja, username: res.ninja?.username ?? username, rank };
  await this.setSession(res.token, ninjaFixed);
}


  async logout(): Promise<void> {
    this.token = null;
    this.ninjaSubject.next(null);

    await Preferences.remove({ key: 'token' });
    await Preferences.remove({ key: 'ninja' });
  }

  private normalizeNinja(n: Ninja | null): Ninja | null {
    if (!n) return null;

    const rank = (n as any).rank as NinjaRank | undefined;

    return {
      id: (n as any).id ?? '',
      username: (n as any).username ?? '',
      rank: rank ?? 'Genin',
      xp: (n as any).xp,
    };
  }

  private async setSession(token: string, ninja: Ninja): Promise<void> {
    const ninjaOk = this.normalizeNinja(ninja)!;

    this.token = token;
    this.ninjaSubject.next(ninjaOk);

    await Preferences.set({ key: 'token', value: token });
    await Preferences.set({ key: 'ninja', value: JSON.stringify(ninjaOk) });
  }
}
