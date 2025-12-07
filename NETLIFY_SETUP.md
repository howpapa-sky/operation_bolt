# Netlify 환경 변수 설정 가이드

## 필수 환경 변수

Netlify 대시보드에서 다음 환경 변수를 설정해야 합니다:

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/sites/operationmanus/configuration/env

2. **환경 변수 추가**

   ```
   VITE_SUPABASE_URL=https://qxwyrgludqantaagukey.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3lyZ2x1ZHFhbnRhYWd1a2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTM0NTIsImV4cCI6MjA3OTEyOTQ1Mn0.KkDDXWOJ7l-cEauIXv_navgfCcdLCwBnn0ZGBHzUfvw
   ```

3. **Supabase Anon Key 확인 방법**
   - Supabase 대시보드 접속: https://supabase.com/dashboard/project/qxwyrgludqantaagukey
   - Settings > API 메뉴로 이동
   - "Project API keys" 섹션에서 `anon` `public` 키 복사

4. **재배포**
   - 환경 변수 설정 후 Netlify에서 자동으로 재배포됩니다.
   - 또는 "Trigger deploy" 버튼을 클릭하여 수동으로 재배포할 수 있습니다.

## 확인 사항

- ✅ Supabase 프로젝트 ID: `qxwyrgludqantaagukey`
- ✅ Supabase URL: `https://qxwyrgludqantaagukey.supabase.co`
- ⚠️ Anon Key는 Supabase 대시보드에서 확인 필요

## 문제 해결

만약 여전히 오류가 발생한다면:

1. Netlify 빌드 로그 확인
2. 브라우저 콘솔에서 환경 변수가 제대로 로드되었는지 확인
3. Supabase RLS (Row Level Security) 정책 확인
