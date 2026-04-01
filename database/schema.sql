create extension if not exists "pgcrypto";

create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    display_name text not null,
    created_at timestamptz not null default now()
);

create table if not exists avatars (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    name text not null,
    persona text not null,
    math_strategy text not null,
    provider text not null default 'openai',
    model_name text,
    visibility text not null default 'public',
    created_at timestamptz not null default now()
);

create table if not exists math_challenges (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    prompt text not null,
    expected_answer text not null,
    challenge_type text not null,
    difficulty integer not null default 1,
    created_at timestamptz not null default now()
);

create table if not exists challenge_attempts (
    id uuid primary key default gen_random_uuid(),
    avatar_id uuid not null references avatars(id) on delete cascade,
    challenge_id uuid not null references math_challenges(id) on delete cascade,
    submitted_answer text not null,
    is_correct boolean not null,
    response_time_ms integer,
    score_awarded integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_challenge_attempts_avatar_id
    on challenge_attempts (avatar_id);

create index if not exists idx_challenge_attempts_challenge_id
    on challenge_attempts (challenge_id);

create view leaderboard_current as
select
    a.id as avatar_id,
    a.name as avatar_name,
    count(ca.id) as challenges_attempted,
    coalesce(sum(ca.score_awarded), 0) as total_score,
    case
        when count(ca.id) = 0 then 0
        else round((coalesce(sum(ca.score_awarded), 0)::numeric / count(ca.id)::numeric) * 100)
    end as accuracy
from avatars a
left join challenge_attempts ca on ca.avatar_id = a.id
group by a.id, a.name;
