-- 1. Create custom enum or check constraint for Status
-- We use a check constraint on a text field for easier handling in frontend interfaces.

-- Create jobs table
create table public.jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  role text not null,
  url text,
  notes text,
  status text default 'applied' not null,
  applied_date date default current_date not null,
  follow_up_date date,
  reminder_enabled boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint check_status check (status in ('applied', 'interview', 'offer', 'rejected'))
);

-- Create status_history table
create table public.status_history (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references public.jobs(id) on delete cascade not null,
  old_status text,
  new_status text not null,
  changed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint check_old_status check (old_status is null or old_status in ('applied', 'interview', 'offer', 'rejected')),
  constraint check_new_status check (new_status in ('applied', 'interview', 'offer', 'rejected'))
);

-- Enable Row Level Security (RLS)
alter table public.jobs enable row level security;
alter table public.status_history enable row level security;

-- Create policies for jobs
create policy "Users can view their own jobs."
  on public.jobs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own jobs."
  on public.jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own jobs."
  on public.jobs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own jobs."
  on public.jobs for delete
  using (auth.uid() = user_id);

-- Create policies for status_history
create policy "Users can view their own status history."
  on public.status_history for select
  using (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.status_history.job_id
      and public.jobs.user_id = auth.uid()
    )
  );

create policy "Users can insert their own status history."
  on public.status_history for insert
  with check (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.status_history.job_id
      and public.jobs.user_id = auth.uid()
    )
  );

create policy "Users can update their own status history."
  on public.status_history for update
  using (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.status_history.job_id
      and public.jobs.user_id = auth.uid()
    )
  );

create policy "Users can delete their own status history."
  on public.status_history for delete
  using (
    exists (
      select 1 from public.jobs
      where public.jobs.id = public.status_history.job_id
      and public.jobs.user_id = auth.uid()
    )
  );

-- Create helper function and trigger to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger trigger_handle_updated_at
  before update on public.jobs
  for each row
  execute function public.handle_updated_at();
