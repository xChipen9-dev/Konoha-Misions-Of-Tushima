import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

type MissionState = {
  accepted: string[];
  completed: string[];
};

@Injectable({ providedIn: 'root' })
export class MyMissionsStore {
  private key(username: string) {
    const u = (username ?? '').trim().toLowerCase();
    return `my_missions_${u}`;
  }

  private normalize(state?: Partial<MissionState> | null): MissionState {
    return {
      accepted: Array.isArray(state?.accepted) ? state!.accepted : [],
      completed: Array.isArray(state?.completed) ? state!.completed : [],
    };
  }

  private unique(ids: string[]) {
    return Array.from(new Set(ids.filter(Boolean)));
  }

  private async read(username: string): Promise<MissionState> {
    const { value } = await Preferences.get({ key: this.key(username) });
    if (!value) return { accepted: [], completed: [] };

    try {
      return this.normalize(JSON.parse(value));
    } catch {
      return { accepted: [], completed: [] };
    }
  }

  private async write(username: string, state: MissionState): Promise<void> {
    await Preferences.set({
      key: this.key(username),
      value: JSON.stringify({
        accepted: this.unique(state.accepted),
        completed: this.unique(state.completed),
      }),
    });
  }

  async getAccepted(username: string): Promise<string[]> {
    const s = await this.read(username);
    const completedSet = new Set(s.completed);
    return s.accepted.filter((id) => !completedSet.has(id));
  }

  async getCompleted(username: string): Promise<string[]> {
    const s = await this.read(username);
    return s.completed;
  }

  async getAcceptedCount(username: string): Promise<number> {
    const list = await this.getAccepted(username);
    return list.length;
  }

  async getCompletedCount(username: string): Promise<number> {
    const list = await this.getCompleted(username);
    return list.length;
  }

  async isAccepted(username: string, missionId: string): Promise<boolean> {
    const s = await this.read(username);
    return s.accepted.includes(missionId) && !s.completed.includes(missionId);
  }

  async isCompleted(username: string, missionId: string): Promise<boolean> {
    const s = await this.read(username);
    return s.completed.includes(missionId);
  }

  async accept(username: string, missionId: string): Promise<void> {
    const s = await this.read(username);

    if (s.completed.includes(missionId)) return;

    if (!s.accepted.includes(missionId)) {
      s.accepted.push(missionId);
      await this.write(username, s);
    }
  }

  async markCompleted(username: string, missionId: string): Promise<void> {
    const s = await this.read(username);

    if (!s.accepted.includes(missionId)) s.accepted.push(missionId);
    if (!s.completed.includes(missionId)) s.completed.push(missionId);

    await this.write(username, s);
  }

  async unaccept(username: string, missionId: string): Promise<void> {
    const s = await this.read(username);

    if (s.completed.includes(missionId)) return;

    s.accepted = s.accepted.filter((id) => id !== missionId);
    await this.write(username, s);
  }

  async clearUser(username: string): Promise<void> {
    await Preferences.remove({ key: this.key(username) });
  }
}
