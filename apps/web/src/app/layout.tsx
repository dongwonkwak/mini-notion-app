import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini Notion - 실시간 협업 에디터',
  description: 'Y.js, Tiptap, Hocuspocus를 활용한 실시간 협업 에디터',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ko'>
      <body>{children}</body>
    </html>
  );
}
