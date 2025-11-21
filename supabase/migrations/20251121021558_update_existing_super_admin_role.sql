/*
  # Update Existing Super Admin Role

  ## 개요
  - 이미 가입된 yong@howlab.co.kr 사용자의 role을 super_admin으로 업데이트
  - 기존 트리거가 이미 존재하므로 새로운 가입자는 자동으로 role이 할당됨

  ## 변경사항
  1. 기존 yong@howlab.co.kr 사용자의 role을 super_admin으로 업데이트
  2. RLS 정책 확인 및 보완
*/

-- Step 1: 기존 yong@howlab.co.kr 사용자의 role을 super_admin으로 업데이트
UPDATE user_profiles
SET role = 'super_admin'
WHERE email = 'yong@howlab.co.kr';

-- Step 2: Role 기반 RLS 정책 확인 (이미 적용되어 있지만 재확인)
-- Projects 테이블은 이미 admin/super_admin만 수정 가능하도록 설정됨
-- Tasks 테이블도 이미 admin/super_admin만 수정 가능하도록 설정됨

-- Step 3: Comments는 모든 사용자가 작성 가능하지만, 자신의 댓글만 삭제 가능
-- 이미 설정되어 있음

-- Step 4: user_profiles의 role 수정은 super_admin만 가능하도록 정책 추가
DROP POLICY IF EXISTS "Super admins can update any profile role" ON user_profiles;

CREATE POLICY "Super admins can update any profile role"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.role = 'super_admin'
    )
  );

-- Step 5: 사용자가 자신의 프로필(이름, 아바타)은 수정 가능하지만 role은 수정 불가
-- 기존 "Users can update own profile" 정책을 role 필드 제외하도록 수정
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id AND role != 'super_admin')
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );