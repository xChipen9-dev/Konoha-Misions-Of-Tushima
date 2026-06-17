import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import type { Mission } from '../models/mission.model';

@Injectable({ providedIn: 'root' })
export class MissionsService {
  constructor(private http: HttpClient) {}

  private noCacheHeaders() {
    return new HttpHeaders({ 'Cache-Control': 'no-cache', Pragma: 'no-cache' });
  }

  async getAllMissions(): Promise<Mission[]> {
    const res: any = await firstValueFrom(
      this.http.get<any>(`${environment.apiUrl}/missions`, { headers: this.noCacheHeaders() })
    );

    if (Array.isArray(res)) return res as Mission[];
    if (Array.isArray(res?.missions)) return res.missions as Mission[];
    if (Array.isArray(res?.data)) return res.data as Mission[];
    return [];
  }

  async getMissionById(id: string): Promise<Mission | null> {
    const list = await this.getAllMissions();
    return list.find(m => m.id === id) ?? null;
  }

  async acceptMission(missionId: string): Promise<any> {
    return firstValueFrom(
      this.http.patch(
        `${environment.apiUrl}/missions/${missionId}/accept`,
        {},
        { headers: this.noCacheHeaders() }
      )
    );
  }

  async reportMission(missionId: string, reportText: string, evidenceImageUrl: string): Promise<any> {
    return firstValueFrom(
      this.http.post(
        `${environment.apiUrl}/missions/${missionId}/report`,
        { reportText, evidenceImageUrl },
        { headers: this.noCacheHeaders() }
      )
    );
  }

  async ensureAccepted(missionId: string): Promise<void> {
    try {
      await this.acceptMission(missionId);
    } catch (e: any) {
      if (e?.status === 401) throw e;
    }
  }
}
