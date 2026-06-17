import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { Stats } from '../models/stats.model';
import type { NinjaRank } from '../models/ninja.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private http: HttpClient) {}

  async getMyStats(): Promise<Stats> {
    const headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    });

    const res: any = await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/ninjas/me/stats`, { headers })
    );

    const rankFromApi = (res?.rank ?? res?.ninja?.rank) as NinjaRank | undefined;

    return {
      xp: Number(res?.xp ?? 0),
      rank: rankFromApi, 
      missionsCompleted: Number(res?.missionsCompleted ?? res?.missions_completed ?? 0),
    };
  }
}
