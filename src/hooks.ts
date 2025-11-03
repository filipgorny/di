import { useMemo } from 'react';
import { Container } from './container';
import { ClassType } from '@filipgorny/types';

export function useContainer<T>(container: Container, nameOrClass: string | ClassType<T>): T {
  return useMemo(() => container.get(nameOrClass), [container, nameOrClass]);
}