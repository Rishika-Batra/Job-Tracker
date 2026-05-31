export type Status = 'applied' | 'interview' | 'offer' | 'accepted' | 'rejected';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  url: string | null;
  notes: string | null;
  status: Status;
  created_at: string;
  applied_date: string;
  follow_up_date: string | null;
  reminder_enabled: boolean;
  updated_at: string;
}

export interface StatusHistory {
  id: string;
  job_id: string;
  old_status: Status | null;
  new_status: Status;
  changed_at: string;
}
