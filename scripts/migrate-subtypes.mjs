import { drizzle } from "drizzle-orm/mysql2";
import { projects } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL);

async function migrateData() {
  try {
    console.log("🔄 기존 데이터 마이그레이션 시작...");
    
    // projectSubtype 값이 있는 모든 프로젝트 가져오기
    const allProjects = await db.select().from(projects);
    
    console.log(`총 ${allProjects.length}개의 프로젝트 발견`);
    
    let updated = 0;
    for (const project of allProjects) {
      // projectSubtype이 문자열로 저장되어 있을 경우 배열로 변환
      if (project.projectSubtype && typeof project.projectSubtype === 'string') {
        const subtypes = [project.projectSubtype];
        
        await db
          .update(projects)
          .set({ projectSubtypes: subtypes })
          .where(eq(projects.id, project.id));
        
        console.log(`✅ 프로젝트 ID ${project.id}: "${project.projectSubtype}" → [${subtypes.join(", ")}]`);
        updated++;
      }
    }
    
    console.log(`\n✅ 총 ${updated}개의 프로젝트가 업데이트되었습니다!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  }
}

migrateData();
