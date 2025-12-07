-- 브랜드 테이블
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('화장품', '부자재')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 제조사 테이블
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  contact TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 제작 업체 테이블
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('상세페이지', '디자인', '촬영', '기타')),
  contact TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 셀러 테이블
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  platform TEXT,
  contact TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 평가 기준 테이블 (기존 evaluation_items를 확장)
CREATE TABLE IF NOT EXISTS evaluation_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 프로젝트 코멘트 테이블 (기존 comments 테이블과 별도)
CREATE TABLE IF NOT EXISTS project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- projects 테이블에 신규 필드 추가
ALTER TABLE projects ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS manufacturer_id UUID REFERENCES manufacturers(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES sellers(id);

-- 상세페이지 제작 관련 필드
ALTER TABLE projects ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS work_type TEXT CHECK (work_type IN ('신규', '리뉴얼'));
ALTER TABLE projects ADD COLUMN IF NOT EXISTS includes_photography BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS includes_planning BOOLEAN DEFAULT FALSE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget INTEGER;

-- 인플루언서 협업 관련 필드
ALTER TABLE projects ADD COLUMN IF NOT EXISTS collaboration_type TEXT CHECK (collaboration_type IN ('제품협찬', '유가콘텐츠'));

-- 제품 발주 관련 필드
ALTER TABLE projects ADD COLUMN IF NOT EXISTS container_material_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS box_material_id UUID;

-- 공동구매 관련 필드
ALTER TABLE projects ADD COLUMN IF NOT EXISTS revenue INTEGER;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contribution_profit INTEGER;

-- 파일 첨부 필드
ALTER TABLE projects ADD COLUMN IF NOT EXISTS attached_files JSONB DEFAULT '[]'::jsonb;

-- evaluations 필드 추가 (기존 evaluation_criteria와 통합)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS evaluations JSONB DEFAULT '[]'::jsonb;

-- users 테이블에 manager 역할 추가
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'manager', 'user', 'viewer'));

-- 기본 브랜드 데이터 삽입
INSERT INTO brands (name, description) VALUES 
  ('하우파파', '하우파파 브랜드'),
  ('누씨오', '누씨오 브랜드')
ON CONFLICT (name) DO NOTHING;

-- 기본 카테고리 데이터 삽입
INSERT INTO categories (name, type, description) VALUES 
  ('크림', '화장품', '크림 제품'),
  ('패드', '화장품', '패드 제품'),
  ('로션', '화장품', '로션 제품'),
  ('스틱', '화장품', '스틱 제품'),
  ('앰플', '화장품', '앰플 제품'),
  ('세럼', '화장품', '세럼 제품'),
  ('미스트', '화장품', '미스트 제품'),
  ('용기', '부자재', '용기 부자재'),
  ('단상자', '부자재', '단상자 부자재')
ON CONFLICT (name) DO NOTHING;

-- 기본 제조사 데이터 삽입
INSERT INTO manufacturers (name) VALUES 
  ('콜마'),
  ('코스맥스'),
  ('기타')
ON CONFLICT (name) DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_projects_brand_id ON projects(brand_id);
CREATE INDEX IF NOT EXISTS idx_projects_category_id ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_manufacturer_id ON projects(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_projects_vendor_id ON projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_projects_seller_id ON projects(seller_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_criteria_category_id ON evaluation_criteria(category_id);

-- RLS 정책 설정
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 마스터 데이터를 조회할 수 있도록 설정
CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON manufacturers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON vendors FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON sellers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON evaluation_criteria FOR SELECT USING (true);

-- admin과 manager만 마스터 데이터를 수정할 수 있도록 설정
CREATE POLICY "Enable insert for admin and manager" ON brands FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON brands FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON brands FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Enable insert for admin and manager" ON categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Enable insert for admin and manager" ON manufacturers FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON manufacturers FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON manufacturers FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Enable insert for admin and manager" ON vendors FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON vendors FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON vendors FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Enable insert for admin and manager" ON sellers FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON sellers FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON sellers FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Enable insert for admin and manager" ON evaluation_criteria FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable update for admin and manager" ON evaluation_criteria FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')));
CREATE POLICY "Enable delete for admin only" ON evaluation_criteria FOR DELETE 
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- 프로젝트 코멘트 RLS 정책
CREATE POLICY "Enable read access for all users" ON project_comments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON project_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for comment owner" ON project_comments FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for comment owner or admin" ON project_comments FOR DELETE 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_manufacturers_updated_at BEFORE UPDATE ON manufacturers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_criteria_updated_at BEFORE UPDATE ON evaluation_criteria
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
