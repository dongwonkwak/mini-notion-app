// UI Components will be implemented in future tasks

// Placeholder exports for build compatibility
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export interface ThemeConfig {
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

// TODO: Implement in Task 22 - 모바일 반응형 인터페이스 구현
export const Button: React.FC<ButtonProps> = (/* { children, onClick } */) => {
  return null; // Placeholder
};

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
}> = (/* { children } */) => {
  return null; // Placeholder
};

export const cn = (...classes: string[]) => classes.join(' ');
