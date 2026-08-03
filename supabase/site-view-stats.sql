-- 진안문화아트 전체/오늘 조회수 기능
-- Supabase SQL Editor에서 한 번만 실행하세요.

create table if not exists public.site_view_stats (
  id bigint primary key,
  total_views bigint not null default 0,
  today_views bigint not null default 0,
  view_date date not null default current_date,
  updated_at timestamptz not null default now()
);

alter table public.site_view_stats
  add column if not exists total_views bigint not null default 0,
  add column if not exists today_views bigint not null default 0,
  add column if not exists view_date date not null default current_date,
  add column if not exists updated_at timestamptz not null default now();

insert into public.site_view_stats (id, total_views, today_views, view_date)
values (1, 0, 0, current_date)
on conflict (id) do nothing;

create or replace function public.increment_site_view_stats()
returns table(total_views bigint, today_views bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.site_view_stats
  set total_views = coalesce(site_view_stats.total_views, 0) + 1,
      today_views = case when site_view_stats.view_date = current_date
                         then coalesce(site_view_stats.today_views, 0) + 1 else 1 end,
      view_date = current_date,
      updated_at = now()
  where id = 1;

  return query select s.total_views, s.today_views
  from public.site_view_stats s where s.id = 1;
end;
$$;

create or replace function public.get_site_view_stats()
returns table(total_views bigint, today_views bigint)
language sql
security definer
set search_path = public
as $$
  select s.total_views,
         case when s.view_date = current_date then s.today_views else 0 end
  from public.site_view_stats s where s.id = 1;
$$;

grant execute on function public.increment_site_view_stats() to anon, authenticated;
grant execute on function public.get_site_view_stats() to anon, authenticated;
