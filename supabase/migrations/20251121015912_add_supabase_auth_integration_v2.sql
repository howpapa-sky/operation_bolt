/*
  # Supabase Auth Integration & Role-Based Access Control

  ## 개요
  - Supabase Auth를 사용한 이메일/비밀번호 인증 시스템 구축
  - 사용자 프로필 자동 생성 및 역할 기반 권한 관리
  - Super Admin 자동 지정 시스템

  ## 변경사항

  1. **user_profiles 테이블 생성**
     - id (uuid, auth.users와 연결)
     - email (text)
     - full_name (text)
     - role (text) - super_admin, admin, viewer
     - avatar_url (text)
     - created_at, updated_at

  2. **자동 역할 할당**
     - yong@howlab.co.kr → super_admin
     - 기타 사용자 → viewer (기본값)

  3. **Trigger 함수**
     - Supabase Auth 회원가입 시 user_profiles 자동 생성
     - 이메일 기반 역할 자동 할당

  4. **RLS 정책**
     - super_admin: 모든 데이터 접근 및 수정
     - admin: 프로젝트 및 작업 관리
     - viewer: 읽기 전용

  5. **기존 users 테이블 마이그레이션**
     - 기존 users 테이블을 legacy_users로 이름 변경
     - user_profiles를 새로운 사용자 관리 테이블로 사용
*/

-- Step 1: 기존 users 테이블 이름 변경
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'users' AND table_schema = 'public'
  ) THEN
    ALTER TABLE users RENAME TO legacy_users;
  END IF;
END $$;

-- Step 2: user_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles (기존 정책 삭제 후 재생성)
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can update any profile" ON user_profiles;

CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can update any profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Step 3: 자동 프로필 생성 및 역할 할당 함수
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
BEGIN
  -- 이메일에 따라 역할 결정
  IF NEW.email = 'yong@howlab.co.kr' THEN
    user_role := 'super_admin';
  ELSE
    user_role := 'viewer';
  END IF;

  -- user_profiles에 프로필 생성
  INSERT INTO user_profiles (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_role,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Trigger 생성 (auth.users에 새 사용자 생성 시 자동 실행)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Step 5: updated_at 자동 업데이트 트리거
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 6: 기존 테이블의 외래키 업데이트
-- projects 테이블의 owner_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'projects_owner_id_fkey'
    AND table_name = 'projects'
  ) THEN
    ALTER TABLE projects DROP CONSTRAINT projects_owner_id_fkey;
  END IF;

  ALTER TABLE projects
    ADD CONSTRAINT projects_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES user_profiles(id)
    ON DELETE SET NULL;
END $$;

-- tasks 테이블의 assignee_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_assignee_id_fkey'
    AND table_name = 'tasks'
  ) THEN
    ALTER TABLE tasks DROP CONSTRAINT tasks_assignee_id_fkey;
  END IF;

  ALTER TABLE tasks
    ADD CONSTRAINT tasks_assignee_id_fkey
    FOREIGN KEY (assignee_id)
    REFERENCES user_profiles(id)
    ON DELETE SET NULL;
END $$;

-- comments 테이블의 user_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'comments_user_id_fkey'
    AND table_name = 'comments'
  ) THEN
    ALTER TABLE comments DROP CONSTRAINT comments_user_id_fkey;
  END IF;

  ALTER TABLE comments
    ADD CONSTRAINT comments_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;
END $$;

-- activity_logs 테이블의 user_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'activity_logs_user_id_fkey'
    AND table_name = 'activity_logs'
  ) THEN
    ALTER TABLE activity_logs DROP CONSTRAINT activity_logs_user_id_fkey;
  END IF;

  ALTER TABLE activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE SET NULL;
END $$;

-- audit_logs 테이블의 user_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'audit_logs_user_id_fkey'
    AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
  END IF;

  ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE SET NULL;
END $$;

-- user_sessions 테이블의 user_id를 user_profiles와 연결
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_sessions_user_id_fkey'
    AND table_name = 'user_sessions'
  ) THEN
    ALTER TABLE user_sessions DROP CONSTRAINT user_sessions_user_id_fkey;
  END IF;

  ALTER TABLE user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES user_profiles(id)
    ON DELETE CASCADE;
END $$;

-- Step 7: RLS 정책 업데이트 (role 기반)
-- Projects 테이블
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;
DROP POLICY IF EXISTS "Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Admins can update projects" ON projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON projects;

CREATE POLICY "Admins can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Tasks 테이블
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can create tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can update tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON tasks;

CREATE POLICY "Admins can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Sample Evaluations 테이블
DROP POLICY IF EXISTS "Authenticated users can manage evaluations" ON sample_evaluations;
DROP POLICY IF EXISTS "Admins can create evaluations" ON sample_evaluations;
DROP POLICY IF EXISTS "Admins can update evaluations" ON sample_evaluations;
DROP POLICY IF EXISTS "Admins can delete evaluations" ON sample_evaluations;

CREATE POLICY "Admins can create evaluations"
  ON sample_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update evaluations"
  ON sample_evaluations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete evaluations"
  ON sample_evaluations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Evaluators 테이블
DROP POLICY IF EXISTS "Authenticated users can manage evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can create evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can update evaluators" ON evaluators;
DROP POLICY IF EXISTS "Admins can delete evaluators" ON evaluators;

CREATE POLICY "Admins can create evaluators"
  ON evaluators FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can update evaluators"
  ON evaluators FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can delete evaluators"
  ON evaluators FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'admin')
    )
  );

-- Step 8: 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);