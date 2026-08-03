-- 진안문화아트 문화행사 조회수 기능
alter table public.events
add column if not exists views bigint not null default 0;

update public.events
set views = 0
where views is null;

create or replace function public.increment_event_views(event_id_input uuid)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_views bigint;
begin
  update public.events
  set views = coalesce(views, 0) + 1
  where id = event_id_input
    and approved = true
  returning views into updated_views;

  return updated_views;
end;
$$;

grant execute on function public.increment_event_views(uuid) to anon;
grant execute on function public.increment_event_views(uuid) to authenticated;
