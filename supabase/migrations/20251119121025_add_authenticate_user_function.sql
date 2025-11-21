/*
  # 사용자 인증 함수 추가

  ## 새로운 함수
  - authenticate_user: 이메일과 비밀번호로 사용자 인증
    - bcrypt를 사용하여 비밀번호 검증
    - 성공 시 사용자 정보 반환
    - 실패 시 빈 배열 반환

  ## 보안
  - 비밀번호는 해싱되어 저장됨
  - pgcrypto 확장 사용
*/

-- 사용자 인증 함수
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