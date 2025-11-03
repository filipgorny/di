import { useMemo, useContext, createContext, ReactNode, createElement } from 'react';
import { Container } from './container';
import { ClassType } from '@filipgorny/types';

const ContainerContext = createContext<Container | null>(null);

export function ContainerProvider({ container, children }: { container: Container; children: ReactNode }) {
  return createElement(ContainerContext.Provider, { value: container }, children);
}

export function useContainer<T>(nameOrClass?: string | ClassType<T>): T {
  const container = useContext(ContainerContext);
  if (!container) {
    throw new Error('useContainer must be used within a ContainerProvider');
  }
  return useMemo(() => container.get(nameOrClass!), [container, nameOrClass]);
}