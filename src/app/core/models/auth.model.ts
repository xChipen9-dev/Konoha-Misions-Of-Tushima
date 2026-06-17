import { Ninja } from './ninja.model';

export interface AuthResponse {
  token: string;
  ninja: Ninja;
}
