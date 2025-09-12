import { describe, expect, it } from '@jest/globals';
import { execSync } from 'child_process';
import { prisma } from '../index';

describe('Database Seeding', () => {
  it('should seed database with test data successfully', async () => {
    // 시딩 실행
    execSync('pnpm db:seed', { stdio: 'inherit' });

    // 사용자 확인
    const users = await prisma.user.findMany();
    expect(users).toHaveLength(5);
    
    const adminUser = users.find(u => u.email === 'admin@example.com');
    expect(adminUser).toBeDefined();
    expect(adminUser?.name).toBe('관리자');

    // 워크스페이스 확인
    const workspaces = await prisma.workspace.findMany({
      include: { members: true }
    });
    expect(workspaces).toHaveLength(1);
    expect(workspaces[0].members).toHaveLength(5);

    // 페이지 확인
    const pages = await prisma.page.findMany({
      include: { document: true }
    });
    expect(pages.length).toBeGreaterThanOrEqual(10);
    
    // 모든 페이지에 문서가 연결되어 있는지 확인
    pages.forEach(page => {
      expect(page.document).toBeDefined();
    });

    // 계층 구조 확인
    const rootPages = pages.filter(p => !p.parentId);
    const childPages = pages.filter(p => p.parentId);
    
    expect(rootPages.length).toBeGreaterThan(0);
    expect(childPages.length).toBeGreaterThan(0);

    // 댓글 확인
    const comments = await prisma.comment.findMany();
    expect(comments.length).toBeGreaterThanOrEqual(2);
  });

  it('should create valid workspace member roles', async () => {
    const members = await prisma.workspaceMember.findMany({
      include: { user: true }
    });

    const roles = members.map(m => m.role);
    expect(roles).toContain('owner');
    expect(roles).toContain('editor');
    expect(roles).toContain('viewer');

    // 소유자는 1명이어야 함
    const owners = members.filter(m => m.role === 'owner');
    expect(owners).toHaveLength(1);
  });

  it('should create valid page permissions structure', async () => {
    const pages = await prisma.page.findMany();
    
    pages.forEach(page => {
      expect(page.permissions).toBeDefined();
      
      const permissions = page.permissions as any;
      expect(permissions.read).toBeDefined();
      expect(permissions.write).toBeDefined();
      expect(permissions.admin).toBeDefined();
      
      expect(Array.isArray(permissions.read)).toBe(true);
      expect(Array.isArray(permissions.write)).toBe(true);
      expect(Array.isArray(permissions.admin)).toBe(true);
    });
  });
});