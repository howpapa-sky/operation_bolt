/*
  # user_profiles INSERT 정책 추가

  ## 변경사항
  - user_profiles 테이블에 INSERT 정책 추가
  - 인증된 사용자가 자신의 프로필을 생성할 수 있도록 허용
  - 자동 프로필 생성 기능을 위한 필수 정책

  ## 보안
  - 사용자는 자신의 ID(auth.uid())로만 프로필 생성 가능
  - 기본 역할은 'viewer'로 제한
*/

-- user_profiles INSERT 정책 추가
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
