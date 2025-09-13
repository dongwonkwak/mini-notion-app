#!/usr/bin/env node

/**
 * Task 완료 시 자동 문서 생성 스크립트
 *
 * 기능:
 * 1. 완료된 Task 분석
 * 2. 필요한 문서 타입 식별
 * 3. 템플릿 기반 문서 자동 생성
 * 4. 기존 문서 업데이트
 */

const fs = require('fs');
const path = require('path');

// Task 타입별 문서 매핑
const TASK_DOC_MAPPING = {
  // 인증/권한 관련
  auth: {
    docs: [
      'auth/permissions.md',
      'auth/authentication.md',
      'auth/security-policies.md',
    ],
    apiDocs: true,
    examples: true,
  },

  // UI 컴포넌트 관련
  ui: {
    docs: ['ui/design-system.md', 'ui/component-library.md'],
    storybook: true,
    examples: true,
  },

  // API 관련
  api: {
    docs: ['api/rest-api.md', 'api/websocket-api.md'],
    openapi: true,
    postman: true,
  },

  // 데이터베이스 관련
  database: {
    docs: ['architecture/database-schema.md'],
    migration: true,
    erd: true,
  },

  // 실시간 협업 관련
  collaboration: {
    docs: ['architecture/realtime-collaboration.md'],
    websocket: true,
    examples: true,
  },
};

// 문서 템플릿
const DOC_TEMPLATES = {
  'feature-guide': `# {FEATURE_NAME} 가이드

## 📋 개요
{FEATURE_DESCRIPTION}

## 🚀 주요 기능
{FEATURE_LIST}

## 💻 사용법
{USAGE_EXAMPLES}

## 🔧 설정
{CONFIGURATION}

## 🧪 테스트
{TEST_EXAMPLES}

## 📚 참고 자료
{REFERENCES}
`,

  'api-endpoint': `### {ENDPOINT_NAME}
\`\`\`http
{HTTP_METHOD} {ENDPOINT_PATH}
Authorization: Bearer {token}
\`\`\`

**권한 요구사항**: {PERMISSION_LEVEL}

**요청:**
\`\`\`json
{REQUEST_EXAMPLE}
\`\`\`

**응답:**
\`\`\`json
{RESPONSE_EXAMPLE}
\`\`\`
`,

  'component-doc': `## {COMPONENT_NAME}

### Props
\`\`\`typescript
{PROPS_INTERFACE}
\`\`\`

### 사용 예시
\`\`\`tsx
{USAGE_EXAMPLE}
\`\`\`

### Storybook
- [기본 사용법]({STORYBOOK_LINK})
- [모든 변형]({STORYBOOK_VARIANTS})
`,
};

async function analyzeCompletedTask(taskNumber) {
  console.log(`📊 Task ${taskNumber} 분석 중...`);

  // tasks.md에서 완료된 Task 정보 추출
  const tasksContent = fs.readFileSync(
    '.kiro/specs/realtime-collaborative-editor/tasks.md',
    'utf8'
  );

  // Task 내용 파싱
  const taskMatch = tasksContent.match(
    new RegExp(`- \\[x\\] ${taskNumber}\\. (.+?)(?=\\n- \\[|$)`, 's')
  );

  if (!taskMatch) {
    console.log(`❌ Task ${taskNumber}를 찾을 수 없습니다.`);
    return null;
  }

  const taskContent = taskMatch[1];
  const taskTitle = taskContent.split('\n')[0];

  console.log(`✅ 발견된 Task: ${taskTitle}`);

  // Task 타입 식별
  const taskType = identifyTaskType(taskTitle, taskContent);
  console.log(`🏷️ Task 타입: ${taskType}`);

  return {
    number: taskNumber,
    title: taskTitle,
    content: taskContent,
    type: taskType,
  };
}

function identifyTaskType(title, content) {
  const keywords = {
    auth: ['인증', '권한', 'NextAuth', 'JWT', 'MFA', 'Permission'],
    ui: ['UI', '컴포넌트', 'v0.dev', 'Storybook', '디자인'],
    api: ['API', 'REST', 'GraphQL', '엔드포인트'],
    database: ['데이터베이스', 'Prisma', '스키마', 'DB'],
    collaboration: ['실시간', '협업', 'Y.js', 'Hocuspocus', 'WebSocket'],
    editor: ['에디터', 'Tiptap', '편집'],
    file: ['파일', '업로드', 'S3', 'MinIO'],
    search: ['검색', 'Elasticsearch', 'Fuse.js'],
  };

  for (const [type, typeKeywords] of Object.entries(keywords)) {
    if (
      typeKeywords.some(
        keyword => title.includes(keyword) || content.includes(keyword)
      )
    ) {
      return type;
    }
  }

  return 'general';
}

async function generateDocuments(taskInfo) {
  console.log(`📝 ${taskInfo.type} 타입 문서 생성 중...`);

  const mapping = TASK_DOC_MAPPING[taskInfo.type];
  if (!mapping) {
    console.log(`⚠️ ${taskInfo.type} 타입에 대한 문서 매핑이 없습니다.`);
    return [];
  }

  const generatedDocs = [];

  // 기본 문서 생성
  if (mapping.docs) {
    for (const docPath of mapping.docs) {
      const fullPath = `docs/${docPath}`;

      if (!fs.existsSync(fullPath)) {
        console.log(`📄 새 문서 생성: ${fullPath}`);

        const docContent = generateDocContent(taskInfo, docPath);

        // 디렉토리 생성
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, docContent);
        generatedDocs.push(fullPath);
      } else {
        console.log(`📝 기존 문서 업데이트: ${fullPath}`);
        updateExistingDoc(fullPath, taskInfo);
        generatedDocs.push(fullPath);
      }
    }
  }

  // API 문서 자동 생성
  if (mapping.apiDocs) {
    console.log('🔄 API 문서 자동 생성...');
    await generateApiDocs(taskInfo);
  }

  // ESLint 검사 및 자동 수정
  if (generatedDocs.length > 0) {
    console.log('🔍 생성된 문서 ESLint 검사...');
    try {
      execSync('pnpm eslint docs/ --fix', { stdio: 'inherit' });
      console.log('✅ 문서 ESLint 검사 완료');
    } catch (error) {
      console.warn('⚠️ 문서 ESLint 검사 중 경고:', error.message);
    }
  }

  // Storybook 스토리 생성
  if (mapping.storybook) {
    console.log('📚 Storybook 스토리 생성...');
    await generateStorybookStories(taskInfo);
  }

  return generatedDocs;
}

function generateDocContent(taskInfo, docPath) {
  const docType = path.basename(docPath, '.md');

  // 문서 타입별 템플릿 선택
  let template = DOC_TEMPLATES['feature-guide'];

  if (docPath.includes('api/')) {
    template = DOC_TEMPLATES['api-endpoint'];
  } else if (docPath.includes('ui/')) {
    template = DOC_TEMPLATES['component-doc'];
  }

  // 템플릿 변수 치환
  return template
    .replace(/{FEATURE_NAME}/g, taskInfo.title)
    .replace(
      /{FEATURE_DESCRIPTION}/g,
      `Task ${taskInfo.number}에서 구현된 기능입니다.`
    )
    .replace(/{FEATURE_LIST}/g, extractFeatureList(taskInfo.content))
    .replace(/{USAGE_EXAMPLES}/g, '사용 예시가 여기에 추가됩니다.')
    .replace(/{CONFIGURATION}/g, '설정 방법이 여기에 추가됩니다.')
    .replace(/{TEST_EXAMPLES}/g, '테스트 예시가 여기에 추가됩니다.')
    .replace(/{REFERENCES}/g, '관련 문서 링크가 여기에 추가됩니다.');
}

function extractFeatureList(content) {
  const lines = content.split('\n');
  const features = lines
    .filter(line => line.trim().startsWith('-') && !line.includes('요구사항:'))
    .map(line => line.trim())
    .slice(0, 5); // 최대 5개만

  return features.join('\n');
}

async function updateDocsReadme(generatedDocs) {
  console.log('📋 docs/README.md 업데이트 중...');

  const readmePath = 'docs/README.md';
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // 새로 생성된 문서들을 README에 추가
  for (const docPath of generatedDocs) {
    const relativePath = docPath.replace('docs/', './');
    const docName = path.basename(docPath, '.md');
    const linkText = `- [${docName}](${relativePath})`;

    // 이미 존재하는지 확인
    if (!readmeContent.includes(relativePath)) {
      // 적절한 섹션에 추가
      const section = getDocumentSection(docPath);
      const sectionRegex = new RegExp(`(### ${section}[\\s\\S]*?)(\n### |$)`);

      if (sectionRegex.test(readmeContent)) {
        readmeContent = readmeContent.replace(sectionRegex, (match, p1, p2) => {
          return p1 + '\n' + linkText + (p2 || '');
        });
      } else {
        // 섹션이 없으면 끝에 추가
        readmeContent += `\n\n### ${section}\n${linkText}`;
      }

      console.log(`✅ README에 추가: ${relativePath}`);
    }
  }

  fs.writeFileSync(readmePath, readmeContent);
}

function getDocumentSection(docPath) {
  if (docPath.includes('auth/')) return '🔐 인증 및 권한';
  if (docPath.includes('ui/')) return '🎨 UI/UX 가이드';
  if (docPath.includes('api/')) return '📡 API 문서';
  if (docPath.includes('architecture/')) return '🏗️ 아키텍처';
  if (docPath.includes('deployment/')) return '🚀 배포 및 운영';
  if (docPath.includes('testing/')) return '🧪 테스트';
  return '📖 기타 문서';
}

// 메인 실행 함수
async function main() {
  const taskNumber = process.argv[2];

  if (!taskNumber) {
    console.log('❌ Task 번호를 입력해주세요.');
    console.log('사용법: node scripts/auto-document-task.js 3');
    process.exit(1);
  }

  console.log(`🚀 Task ${taskNumber} 문서화 자동화 시작`);

  try {
    // 1. Task 분석
    const taskInfo = await analyzeCompletedTask(taskNumber);
    if (!taskInfo) return;

    // 2. 문서 생성
    const generatedDocs = await generateDocuments(taskInfo);

    // 3. README 업데이트
    if (generatedDocs.length > 0) {
      await updateDocsReadme(generatedDocs);
    }

    console.log(`✅ Task ${taskNumber} 문서화 완료!`);
    console.log(`📄 생성된 문서: ${generatedDocs.length}개`);
    generatedDocs.forEach(doc => console.log(`   - ${doc}`));
  } catch (error) {
    console.error('❌ 문서화 중 오류 발생:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  analyzeCompletedTask,
  generateDocuments,
  updateDocsReadme,
};
