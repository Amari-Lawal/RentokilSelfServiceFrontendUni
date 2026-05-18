export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  username: string;
  is_admin: boolean;
  roles: Role[];
}

export interface Insect {
  id: number;
  name: string;
  description?: string;
  danger_level: number;
}

export interface Appointment {
  id: number;
  user_id: number;
  creator_username?: string;
  date: string;
  time: string;
  insect_id: number;
  door_number: string;
  road_name: string;
  postcode: string;
  notes?: string;
  status: string;
  insect?: Insect;
}
