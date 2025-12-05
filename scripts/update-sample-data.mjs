import { drizzle } from "drizzle-orm/mysql2";
import { projects } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

// 샘플 이미지 URL (Unsplash 무료 이미지 사용)
const sampleImages = [
  "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
  "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800",
  "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800",
];

const updates = [
  {
    name: "[누씨오 부활초 패드] 1차 샘플링",
    evaluationComment: "전반적으로 우수한 품질입니다. 텍스처가 부드럽고 흡수력이 뛰어나며, 향도 은은하게 좋습니다. 패키징도 고급스러워 보입니다. 효과도 만족스러운 수준입니다.",
    attachedImages: sampleImages,
  },
  {
    name: "[누씨오 부활초 패드] 2차 샘플링_개선",
    evaluationComment: "1차 대비 개선된 점이 많습니다. 특히 흡수력과 텍스처가 향상되었습니다. 다만 향이 조금 약해진 느낌이 있어 아쉽습니다. 전반적으로는 만족스럽습니다.",
    attachedImages: [sampleImages[0], sampleImages[1]],
  },
  {
    name: "[누씨오 부활초 패드 (리뉴얼)] 3차 샘플링_C",
    evaluationComment: "리뉴얼 버전으로 전체적으로 평범한 수준입니다. 텍스처와 흡수력이 기대에 미치지 못했고, 효과도 보통 수준입니다. 향과 패키징은 괜찮습니다.",
    attachedImages: [sampleImages[2]],
  },
  {
    name: "[누씨오] 제품 출시 - 샘플 - 토너패드",
    evaluationComment: "최종 출시 버전으로 모든 면에서 우수합니다. 텍스처, 흡수력, 향, 효과 모두 만족스럽고, 특히 패키징이 매우 고급스럽습니다. 출시 준비 완료!",
    attachedImages: sampleImages,
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링",
    evaluationComment: "첫 샘플링 결과 전반적으로 개선이 필요합니다. 텍스처가 다소 무겁고, 흡수력도 느린 편입니다. 효과도 기대에 미치지 못했습니다. 2차 샘플링에서 개선이 필요합니다.",
    attachedImages: [sampleImages[0]],
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_코스맥스",
    evaluationComment: "코스맥스 버전으로 평범한 수준입니다. 텍스처와 흡수력이 보통이고, 향도 무난합니다. 효과는 조금 더 개선이 필요해 보입니다.",
    attachedImages: [sampleImages[1]],
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_콜마",
    evaluationComment: "한국콜마 버전으로 코스맥스 대비 우수합니다. 텍스처가 가볍고 흡수력도 좋습니다. 향도 은은하고, 패키징도 깔끔합니다. 다만 효과는 조금 더 지켜봐야 할 것 같습니다.",
    attachedImages: [sampleImages[0], sampleImages[2]],
  },
  {
    name: "[누씨오 부활초 패드] 1차 샘플링_코스맥스",
    evaluationComment: "코스맥스 버전으로 전반적으로 양호합니다. 텍스처와 패키징이 우수하고, 흡수력과 향도 괜찮습니다. 효과는 보통 수준입니다.",
    attachedImages: [sampleImages[1], sampleImages[2]],
  },
];

async function updateData() {
  try {
    console.log("🔄 샘플 데이터 업데이트 시작...");
    
    for (const update of updates) {
      const result = await db
        .update(projects)
        .set({
          evaluationComment: update.evaluationComment,
          attachedImages: update.attachedImages,
        })
        .where(eq(projects.name, update.name));
      
      console.log(`✅ 업데이트됨: ${update.name}`);
    }
    
    console.log(`\n✅ 총 ${updates.length}개의 샘플 프로젝트가 업데이트되었습니다!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

updateData();
