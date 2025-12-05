import { drizzle } from "drizzle-orm/mysql2";
import { projects } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleProjects = [
  {
    name: "[누씨오 부활초 패드] 1차 샘플링",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "누씨오 부활초 토너패드 1차 샘플 평가",
    brand: "누씨오",
    manufacturer: "코스맥스",
    round: 1,
    sampleCode: "NS-TP-001",
    projectSubtype: "토너패드",
    evaluationScores: {
      texture: 4,
      absorption: 4,
      scent: 5,
      packaging: 4,
      effectiveness: 4
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-10-15"),
    dueDate: new Date("2025-10-29")
  },
  {
    name: "[누씨오 부활초 패드] 2차 샘플링_개선",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "1차 피드백 반영 개선 샘플",
    brand: "누씨오",
    manufacturer: "코스맥스",
    round: 2,
    sampleCode: "NS-TP-002",
    projectSubtype: "토너패드",
    evaluationScores: {
      texture: 4,
      absorption: 4,
      scent: 4,
      packaging: 4,
      effectiveness: 3
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-11-01"),
    dueDate: new Date("2025-11-15")
  },
  {
    name: "[누씨오 부활초 패드 (리뉴얼)] 3차 샘플링_C",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "리뉴얼 버전 최종 샘플",
    brand: "누씨오",
    manufacturer: "한국콜마",
    round: 3,
    sampleCode: "NS-TP-003",
    projectSubtype: "토너패드",
    evaluationScores: {
      texture: 3,
      absorption: 3,
      scent: 4,
      packaging: 3,
      effectiveness: 3
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-11-18"),
    dueDate: new Date("2025-12-02")
  },
  {
    name: "[누씨오] 제품 출시 - 샘플 - 토너패드",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "최종 제품 출시용 샘플",
    brand: "누씨오",
    manufacturer: "한국콜마",
    round: 4,
    sampleCode: "NS-TP-004",
    projectSubtype: "토너패드",
    evaluationScores: {
      texture: 4,
      absorption: 4,
      scent: 4,
      packaging: 5,
      effectiveness: 4
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-09-23"),
    dueDate: new Date("2025-10-07")
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "아토로션 첫 샘플 평가",
    brand: "하우파파",
    manufacturer: "코스맥스",
    round: 1,
    sampleCode: "HP-LT-001",
    projectSubtype: "로션",
    evaluationScores: {
      texture: 3,
      absorption: 3,
      scent: 3,
      packaging: 3,
      effectiveness: 2
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-11-18"),
    dueDate: new Date("2025-12-02")
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_코스맥스",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "코스맥스 버전 아토로션",
    brand: "하우파파",
    manufacturer: "코스맥스",
    round: 1,
    sampleCode: "HP-LT-002",
    projectSubtype: "로션",
    evaluationScores: {
      texture: 3,
      absorption: 3,
      scent: 3,
      packaging: 3,
      effectiveness: 3
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-11-21"),
    dueDate: new Date("2025-12-05")
  },
  {
    name: "[하우파파 아토로션] 1차 샘플링_콜마",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "한국콜마 버전 아토로션",
    brand: "하우파파",
    manufacturer: "한국콜마",
    round: 1,
    sampleCode: "HP-LT-003",
    projectSubtype: "로션",
    evaluationScores: {
      texture: 4,
      absorption: 4,
      scent: 4,
      packaging: 4,
      effectiveness: 3
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-11-21"),
    dueDate: new Date("2025-12-05")
  },
  {
    name: "[누씨오 부활초 패드] 1차 샘플링_코스맥스",
    type: "샘플링",
    status: "완료",
    priority: "보통",
    description: "코스맥스 제조 부활초 패드",
    brand: "누씨오",
    manufacturer: "코스맥스",
    round: 1,
    sampleCode: "NS-TP-005",
    projectSubtype: "토너패드",
    evaluationScores: {
      texture: 4,
      absorption: 3,
      scent: 4,
      packaging: 4,
      effectiveness: 3
    },
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-09-23"),
    dueDate: new Date("2025-10-07")
  },
  {
    name: "[누씨오 부활초 선로션] 상세페이지 리뉴얼",
    type: "상세페이지",
    status: "완료",
    priority: "보통",
    description: "선로션 상세페이지 리뉴얼 작업",
    brand: "누씨오",
    manufacturer: "한국콜마",
    round: 2,
    sampleCode: "NS-SL-001",
    projectSubtype: "로션",
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-09-23"),
    dueDate: new Date("2025-10-07")
  },
  {
    name: "[하우파파 선스틱] 샘플링 - 1차",
    type: "샘플링",
    status: "보류",
    priority: "낮음",
    description: "선스틱 첫 샘플 평가",
    brand: "하우파파",
    manufacturer: "코스맥스",
    round: 1,
    sampleCode: "HP-SS-001",
    projectSubtype: "크림",
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-08-05"),
    dueDate: new Date("2025-08-19")
  },
  {
    name: "[하우파파 파우더 스틱] 샘플링 - 1차",
    type: "샘플링",
    status: "보류",
    priority: "보통",
    description: "파우더 스틱 첫 샘플",
    brand: "하우파파",
    manufacturer: "한국콜마",
    round: 1,
    sampleCode: "HP-PS-001",
    projectSubtype: "크림",
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-07-24"),
    dueDate: new Date("2025-08-07")
  },
  {
    name: "[하우파파 선스틱] 샘플링",
    type: "샘플링",
    status: "진행중",
    priority: "보통",
    description: "선스틱 진행 중",
    brand: "하우파파",
    manufacturer: "코스맥스",
    round: 2,
    sampleCode: "HP-SS-002",
    projectSubtype: "크림",
    evaluatorId: 1,
    createdBy: 1,
    startDate: new Date("2025-06-23"),
    dueDate: new Date("2025-07-07")
  }
];

async function seedData() {
  try {
    console.log("🌱 샘플 데이터 생성 시작...");
    
    for (const project of sampleProjects) {
      await db.insert(projects).values(project);
      console.log(`✅ 생성됨: ${project.name}`);
    }
    
    console.log(`\n✅ 총 ${sampleProjects.length}개의 샘플 프로젝트가 생성되었습니다!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

seedData();
