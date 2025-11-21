# 하우파파 프로젝트 관리 시스템 - 실제 환경 이관 가이드

이 가이드는 Bolt 개발 환경에서 실제 운영 환경(GitHub + Supabase + Netlify)으로 완벽하게 이관하는 방법을 안내합니다.

---

## 1단계: Supabase 데이터베이스 스키마 설정

아래 SQL 쿼리를 **Supabase SQL Editor**에 복사하여 실행하세요.

### 완전한 DB 스키마 SQL

```sql
-- =====================================================
-- 하우파파 프로젝트 관리 시스템 - 전체 데이터베이스 스키마
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- 1. USER_PROFILES TABLE (Supabase Auth 연동)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'manager', 'viewer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user profiles"
  ON user_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 2. USERS TABLE (커스텀 사용자 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  project_type text NOT NULL CHECK (project_type IN ('샘플링', '상세페이지', '인플루언서', '제품 발주')),
  project_subtype text,
  status text DEFAULT '대기' CHECK (status IN ('진행 전', '진행 중', '완료', '보류', '대기')),
  priority text DEFAULT '보통' CHECK (priority IN ('낮음', '보통', '높음', '긴급')),
  brand text CHECK (brand IN ('누씨오', '하우파파')),
  manufacturer text,
  sample_round text,
  sample_code text,
  start_date date,
  due_date date,
  completed_date date,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  evaluator_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  evaluator_name text,
  evaluation_criteria jsonb DEFAULT '{}'::jsonb,
  evaluation_comments jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON projects FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create projects"
  ON projects FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete projects"
  ON projects FOR DELETE
  TO public
  USING (true);

-- Add comments for documentation
COMMENT ON COLUMN projects.evaluation_criteria IS 'Stores evaluation criteria and scores (1-5) for each project subtype. Example: {"겉보습": 4, "속건조개선": 5}';
COMMENT ON COLUMN projects.evaluation_comments IS 'Stores evaluation comments for each criterion. Example: {"겉보습": "피부에 잘 흡수됨"}';
COMMENT ON COLUMN projects.manufacturer IS 'Manufacturer name for sample projects (e.g., 한국콜마, 코스맥스)';
COMMENT ON COLUMN projects.sample_round IS 'Sample round number (1-10) for sample projects';
COMMENT ON COLUMN projects.sample_code IS 'Unique sample code identifier for sample projects (e.g., SC-001)';

-- =====================================================
-- 4. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT '할 일' CHECK (status IN ('할 일', '진행 중', '검토', '완료')),
  priority text DEFAULT '보통' CHECK (priority IN ('낮음', '보통', '높음', '긴급')),
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tasks"
  ON tasks FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create tasks"
  ON tasks FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks FOR DELETE
  TO public
  USING (true);

-- =====================================================
-- 5. COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CHECK (project_id IS NOT NULL OR task_id IS NOT NULL)
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. EVALUATORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evaluators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view evaluators"
  ON evaluators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage evaluators"
  ON evaluators FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. SAMPLE_EVALUATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sample_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluator_id uuid REFERENCES evaluators(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  evaluation_date date DEFAULT CURRENT_DATE,
  scores jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sample_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view evaluations"
  ON sample_evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage evaluations"
  ON sample_evaluations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. ACTIVITY_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 9. AUDIT_LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 10. USER_SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- INDEXES (성능 최적화)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type);
CREATE INDEX IF NOT EXISTS idx_projects_brand ON projects(brand);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_sample_evaluations_evaluator ON sample_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_sample_evaluations_project ON sample_evaluations(project_id);

-- =====================================================
-- TRIGGERS (자동 updated_at 업데이트)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_profiles_updated_at') THEN
    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
    CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_comments_updated_at') THEN
    CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- AUTHENTICATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION authenticate_user(
  user_email text,
  user_password text
)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.avatar_url
  FROM users u
  WHERE u.email = user_email
    AND u.password_hash = crypt(user_password, u.password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 데이터베이스 스키마 생성 완료
-- =====================================================
```

---

## 2단계: 환경 변수 설정

### 로컬 개발 환경 (.env 파일)

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Supabase 설정
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# 네이버 웍스 (선택사항)
VITE_NAVER_WORKS_BOT_ID=your_bot_id
VITE_NAVER_WORKS_CHANNEL_ID=your_channel_id
```

### Netlify 환경 변수

Netlify 대시보드에서 다음 환경 변수를 설정하세요:

1. Netlify 사이트 설정 → **Environment variables**로 이동
2. 다음 변수들을 추가:

| Key | Value | 설명 |
|-----|-------|------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase Anon/Public Key |
| `VITE_NAVER_WORKS_BOT_ID` | (선택사항) | 네이버 웍스 봇 ID |
| `VITE_NAVER_WORKS_CHANNEL_ID` | (선택사항) | 네이버 웍스 채널 ID |

---

## 3단계: Supabase 값 확인 방법

### Supabase URL과 Anon Key 찾기

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **API** 메뉴로 이동
4. 다음 값들을 복사:
   - **Project URL**: `VITE_SUPABASE_URL`에 사용
   - **anon public**: `VITE_SUPABASE_ANON_KEY`에 사용

---

## 4단계: GitHub에 코드 푸시

```bash
# Git 초기화 (아직 안했다면)
git init

# 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 변경사항 커밋
git add .
git commit -m "Initial commit - HowPaPa Project Management System"

# GitHub에 푸시
git push -u origin main
```

---

## 5단계: Netlify 배포

### 자동 배포 설정

1. [Netlify Dashboard](https://app.netlify.com) 접속
2. **Add new site** → **Import an existing project** 선택
3. GitHub 연동 후 저장소 선택
4. Build settings 확인:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. **Deploy site** 클릭

### 환경 변수 설정 (중요!)

배포 후 **Site settings** → **Environment variables**에서 위에서 언급한 환경 변수들을 모두 추가하세요.

---

## 6단계: 배포 확인

1. Netlify에서 제공하는 URL로 접속
2. 프로젝트 관리 시스템이 정상 작동하는지 확인
3. 데이터 생성/수정/삭제가 Supabase에 정상 반영되는지 확인

---

## 주요 테이블 구조 요약

| 테이블 | 설명 | 주요 컬럼 |
|--------|------|-----------|
| `user_profiles` | Supabase Auth 사용자 프로필 | email, full_name, role |
| `users` | 커스텀 사용자 테이블 | email, full_name, password_hash, role |
| `projects` | 프로젝트 관리 | name, project_type, status, brand, manufacturer |
| `tasks` | 작업 관리 | title, status, project_id, assignee_id |
| `comments` | 댓글 시스템 | content, user_id, project_id, task_id |
| `evaluators` | 평가자 관리 | name, email, phone |
| `sample_evaluations` | 샘플 평가 | evaluator_id, project_id, scores |
| `activity_logs` | 활동 로그 | user_id, action, entity_type |
| `audit_logs` | 감사 로그 | user_id, action, table_name, record_id |
| `user_sessions` | 세션 관리 | user_id, session_token, expires_at |

---

## 보안 고지사항

현재 RLS 정책은 **개발/테스트용**으로 설정되어 있습니다. (누구나 읽기/쓰기 가능)

프로덕션 환경에서는 다음과 같이 보안을 강화하세요:

```sql
-- 프로젝트 읽기: 인증된 사용자만
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- 프로젝트 생성/수정/삭제: 관리자만
DROP POLICY IF EXISTS "Anyone can create projects" ON projects;
CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );
```

---

## 문제 해결

### 환경 변수가 인식되지 않음

1. `.env` 파일이 프로젝트 루트에 있는지 확인
2. 변수명이 `VITE_`로 시작하는지 확인 (Vite 필수)
3. 개발 서버 재시작: `npm run dev`

### Supabase 연결 오류

1. Supabase URL과 Anon Key가 정확한지 확인
2. Supabase 프로젝트가 활성화되어 있는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### Netlify 빌드 실패

1. 환경 변수가 Netlify에 올바르게 설정되었는지 확인
2. Build command가 `npm run build`인지 확인
3. Publish directory가 `dist`인지 확인

---

## 완료!

이제 프로젝트가 실제 운영 환경에서 완벽하게 작동합니다.
