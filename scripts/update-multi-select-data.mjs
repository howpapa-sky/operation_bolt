import { drizzle } from "drizzle-orm/mysql2";
import { projects } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

const updates = [
  {
    name: "[누씨오 부활초 패드] 1차 샘플링",
    projectSubtypes: ["토너패드"],
    packagingTypes: ["용기", "라벨"],
  },
  {
    name: "[누씨오 부활초 패드] 2차 샘플링_개선",
    projectSubtypes: ["토너패드"],
    packagingTypes: ["용기", "라벨", "단상자"],
  },
  {
    name: "[누씨오 부활초 패드 (리뉴얼)] 3차 샘플링_C",
    projectSubtypes: ["토너패드"],
    packagingTypes: ["용기"],
  },
  {
    name: "[누씨오] 제품 출시 - 샘플 - 토너패드",
    projectSubtypes: ["토너패드"],
    packagingTypes: ["용기", "라벨", "단상자", "포장지"],
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링",
    projectSubtypes: ["로션"],
    packagingTypes: ["용기"],
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_코스맥스",
    projectSubtypes: ["로션"],
    packagingTypes: ["용기", "라벨"],
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_콜마",
    projectSubtypes: ["로션"],
    packagingTypes: ["용기", "라벨"],
  },
  {
    name: "[누씨오 부활초 패드] 1차 샘플링_코스맥스",
    projectSubtypes: ["토너패드"],
    packagingTypes: ["용기", "라벨"],
  },
  {
    name: "[누씨오 부활초 선로션] 상세페이지 리뉴얼",
    projectSubtypes: ["로션"],
    packagingTypes: ["용기", "라벨", "단상자"],
  },
  {
    name: "[하우파파 선스틱] 샘플링",
    projectSubtypes: ["크림", "선케어"],
    packagingTypes: ["용기", "라벨"],
  },
  {
    name: "[하우파파 파우더 스틱] 샘플링 - 1차",
    projectSubtypes: ["크림", "파우더"],
    packagingTypes: ["용기"],
  },
  {
    name: "[하우파파 선스틱] 샘플링 - 1차",
    projectSubtypes: ["크림", "선케어"],
    packagingTypes: ["용기", "라벨"],
  },
];

async function updateData() {
  try {
    console.log("🔄 샘플 데이터 다중 선택 업데이트 시작...");
    
    for (const update of updates) {
      await db
        .update(projects)
        .set({
          projectSubtypes: update.projectSubtypes,
          packagingTypes: update.packagingTypes,
        })
        .where(eq(projects.name, update.name));
      
      console.log(`✅ 업데이트됨: ${update.name}`);
      console.log(`   세부 유형: [${update.projectSubtypes.join(", ")}]`);
      console.log(`   부자재: [${update.packagingTypes.join(", ")}]`);
    }
    
    console.log(`\n✅ 총 ${updates.length}개의 샘플 프로젝트가 업데이트되었습니다!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

updateData();
