import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시딩 시작...');

  // 기존 데이터 정리
  await prisma.comment.deleteMany();
  await prisma.documentHistory.deleteMany();
  await prisma.document.deleteMany();
  await prisma.page.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 테스트 사용자 5명 생성
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: '관리자',
        provider: 'email',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor1@example.com',
        name: '에디터 김철수',
        provider: 'google',
        providerId: 'google_123',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'editor2@example.com',
        name: '에디터 이영희',
        provider: 'github',
        providerId: 'github_456',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor2',
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer1@example.com',
        name: '뷰어 박민수',
        provider: 'email',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'viewer2@example.com',
        name: '뷰어 최지은',
        provider: 'google',
        providerId: 'google_789',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer2',
      },
    }),
  ]);

  console.log(`✅ ${users.length}명의 사용자 생성 완료`);

  // 워크스페이스 1개 생성
  const workspace = await prisma.workspace.create({
    data: {
      name: '미니 노션 테스트 워크스페이스',
      ownerId: users[0].id,
      settings: {
        isPublic: false,
        allowInvites: true,
        theme: 'light',
      },
    },
  });

  console.log(`✅ 워크스페이스 생성 완료: ${workspace.name}`);

  // 워크스페이스 멤버 추가
  await Promise.all([
    prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[0].id,
        role: 'owner',
      },
    }),
    prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[1].id,
        role: 'editor',
      },
    }),
    prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[2].id,
        role: 'editor',
      },
    }),
    prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[3].id,
        role: 'viewer',
      },
    }),
    prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: users[4].id,
        role: 'viewer',
      },
    }),
  ]);

  console.log('✅ 워크스페이스 멤버 추가 완료');

  // 페이지 10개 생성 (계층 구조 포함)
  const pages = [];

  // 루트 페이지들
  const rootPages = await Promise.all([
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '📋 프로젝트 개요',
        documentId: 'doc_project_overview',
        position: 0,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '🚀 시작하기',
        documentId: 'doc_getting_started',
        position: 1,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '📚 문서 가이드',
        documentId: 'doc_documentation',
        position: 2,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
  ]);

  pages.push(...rootPages);

  // 하위 페이지들
  const subPages = await Promise.all([
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '⚙️ 설치 방법',
        documentId: 'doc_installation',
        parentId: rootPages[1].id,
        position: 0,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '🔧 환경 설정',
        documentId: 'doc_configuration',
        parentId: rootPages[1].id,
        position: 1,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '✏️ 에디터 사용법',
        documentId: 'doc_editor_guide',
        parentId: rootPages[2].id,
        position: 0,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '👥 협업 기능',
        documentId: 'doc_collaboration',
        parentId: rootPages[2].id,
        position: 1,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '🎨 테마 설정',
        documentId: 'doc_themes',
        parentId: rootPages[2].id,
        position: 2,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '🔍 검색 기능',
        documentId: 'doc_search',
        parentId: rootPages[2].id,
        position: 3,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
    prisma.page.create({
      data: {
        workspaceId: workspace.id,
        title: '📱 모바일 사용',
        documentId: 'doc_mobile',
        parentId: rootPages[2].id,
        position: 4,
        permissions: {
          read: ['*'],
          write: ['owner', 'admin', 'editor'],
          admin: ['owner', 'admin'],
        },
      },
    }),
  ]);

  pages.push(...subPages);

  console.log(`✅ ${pages.length}개의 페이지 생성 완료`);

  // 문서 상태 생성 (빈 Y.js 문서)
  const emptyYjsState = Buffer.from([]);
  
  await Promise.all(
    pages.map(page =>
      prisma.document.create({
        data: {
          id: page.documentId,
          state: emptyYjsState,
          version: 0,
          sizeBytes: 0,
        },
      })
    )
  );

  console.log('✅ 문서 상태 생성 완료');

  // 샘플 댓글 생성
  await Promise.all([
    prisma.comment.create({
      data: {
        documentId: 'doc_project_overview',
        authorId: users[1].id,
        content: '프로젝트 개요가 잘 정리되어 있네요! 👍',
        positionStart: 0,
        positionEnd: 10,
      },
    }),
    prisma.comment.create({
      data: {
        documentId: 'doc_collaboration',
        authorId: users[2].id,
        content: '실시간 협업 기능이 정말 유용할 것 같습니다.',
        positionStart: 50,
        positionEnd: 80,
      },
    }),
  ]);

  console.log('✅ 샘플 댓글 생성 완료');

  console.log('🎉 시딩 완료!');
  console.log(`
📊 생성된 데이터:
- 사용자: ${users.length}명
- 워크스페이스: 1개
- 페이지: ${pages.length}개
- 문서: ${pages.length}개
- 댓글: 2개

🔑 테스트 계정:
- 관리자: admin@example.com
- 에디터: editor1@example.com, editor2@example.com  
- 뷰어: viewer1@example.com, viewer2@example.com
  `);
}

main()
  .catch(e => {
    console.error('❌ 시딩 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });