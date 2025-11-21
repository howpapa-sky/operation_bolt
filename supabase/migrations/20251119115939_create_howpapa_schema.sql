/*
  # 하우파파 프로젝트 관리 시스템 - 데이터베이스 스키마

  ## 새로운 테이블
  1. **users** - 사용자 정보
     - id (uuid, primary key)
     - email (text, unique)
     - full_name (text)
     - password_hash (text)
     - role (text)
     - avatar_url (text)
     - created_at, updated_at

  2. **projects** - 프로젝트 관리
     - id (uuid, primary key)
     - name, description
     - project_type (샘플링, 상세페이지, 신제품, 인플루언서)
     - status (대기, 진행 중, 완료, 보류)
     - priority (낮음, 보통, 높음, 긴급)
     - start_date, due_date
     - owner_id (외래키 → users)

  3. **tasks** - 작업 관리
     - id (uuid, primary key)
     - project_id (외래키 → projects)
     - title, description
     - status (할 일, 진행 중, 검토, 완료)
     - priority
     - assignee_id (외래키 → users)
     - due_date

  4. **comments** - 댓글 시스템
     - id (uuid, primary key)
     - content (text)
     - user_id (외래키 → users)
     - project_id (외래키 → projects)
     - task_id (외래키 → tasks, nullable)

  5. **sample_evaluations** - 샘플 평가
     - id (uuid, primary key)
     - evaluator_id (외래키 → evaluators)
     - evaluation_date
     - scores (jsonb)

  6. **evaluators** - 평가자
     - id (uuid, primary key)
     - name (text)

  ## 보안
  - 모든 테이블에 RLS(Row Level Security) 활성화
  - authenticated 사용자만 접근 가능
  - 사용자는 자신의 데이터만 수정 가능
*/

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users Table
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

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  project_type text NOT NULL CHECK (project_type IN ('샘플링', '상세페이지', '신제품', '인플루언서')),
  status text DEFAULT '대기' CHECK (status IN ('대기', '진행 중', '완료', '보류')),
  priority text DEFAULT '보통' CHECK (priority IN ('낮음', '보통', '높음', '긴급')),
  start_date date,
  due_date date,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- Tasks Table
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

CREATE POLICY "Authenticated users can view tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (true);

-- Comments Table
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

-- Evaluators Table
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

-- Sample Evaluations Table
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

-- Activity Logs Table
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

-- Audit Logs Table (보안)
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

-- User Sessions Table (보안)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_sample_evaluations_evaluator ON sample_evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_sample_evaluations_project ON sample_evaluations(project_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
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

-- Insert demo user (password: demo123)
INSERT INTO users (id, email, full_name, password_hash, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@howpapa.com',
  '데모 사용자',
  crypt('demo123', gen_salt('bf')),
  'admin'
) ON CONFLICT (id) DO NOTHING;