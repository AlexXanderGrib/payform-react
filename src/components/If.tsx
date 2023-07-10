import { PropsWithChildren, ReactNode } from 'react';

type IfProps = PropsWithChildren<{ condition: boolean; render?: () => ReactNode; }>;

export default function If({ condition, children, render }: IfProps) {
  if (condition) return <>{render ? render() : children}</>;

  return <></>;
}
