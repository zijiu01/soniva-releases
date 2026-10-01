-- Soniva 匿名统计两表（2026-10-02）：Supabase Dashboard → SQL Editor 里整份跑一次即可，可重复执行。
-- 安全模型与谷歌插件 Talkdown 的 td_export_events 相同：
--   * publishable key（公开凭证，已进公开源码）对 anon 只放行 INSERT；
--   * 不建 SELECT/UPDATE/DELETE 策略 → RLS 默认全拒，公网一行都读不到；
--   * 两张表都不含个人身份信息：下载站不带任何用户标识，桌面端只有遥测那条
--     匿名 UUID（用户在设置里关掉遥测时一并停发）。

-- ① 官网下载站的下载点击（soniva-releases src/lib/analytics.ts → DownloadLink 全站唯一挂载点）
create table if not exists public.site_download_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  version text not null,
  platform text not null,
  arch text not null default '',
  filename text not null,
  locale text not null default '',
  page_path text not null default '',
  referrer text
);
alter table public.site_download_events enable row level security;
drop policy if exists "anon insert only" on public.site_download_events;
create policy "anon insert only" on public.site_download_events
  for insert to anon with check (true);

-- ② 桌面端自动更新事件（desktop/src/main/services/update-telemetry.ts，
--    口径：装着旧版的端每次查到/装上/查挂新版本时各报一条）
create table if not exists public.desktop_update_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  client_id uuid not null,
  current_version text not null,
  latest_version text,
  outcome text not null check (outcome in ('not_available', 'available', 'downloaded', 'error')),
  manual boolean not null default false,
  error text
);
alter table public.desktop_update_events enable row level security;
drop policy if exists "anon insert only" on public.desktop_update_events;
create policy "anon insert only" on public.desktop_update_events
  for insert to anon with check (true);

-- 常用口径（Table Editor 里或 SQL 查）：
--   每日真实下载量：select date_trunc('day', created_at) d, count(*) from public.site_download_events group by 1 order by 1;
--   看到更新的独立用户：select count(distinct client_id) from public.desktop_update_events where outcome = 'available';
--   更新失败率：select outcome, count(*) from public.desktop_update_events group by 1;
