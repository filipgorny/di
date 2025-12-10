import "reflect-metadata";
import { ClassType } from "@filipgorny/types";
import { getInjectMetadata, shouldUseTypeResolution } from "./decorators";
import { AmbiguousDependencyError } from "./errors";

type RegistryKey = string | ClassType;

export class Container {
  private registry = new Map<RegistryKey, ClassType>();
  private instances = new Map<RegistryKey, any>();

  register<T>(name: string | ClassType<T>, classType: ClassType<T>): void {
    const key: RegistryKey = name;
    const type: ClassType<T> = classType;

    if (this.registry.has(key)) {
      const keyName = typeof key === "string" ? key : key.name;
      throw new Error(`Dependency '${keyName}' is already registered`);
    }

    this.registry.set(key, type);
  }

  registerInstance<T>(name: string | ClassType<T>, instance: T): void {
    const key: RegistryKey = name;

    if (this.instances.has(key)) {
      const keyName = typeof key === "string" ? key : key.name;
      throw new Error(`Instance '${keyName}' is already registered`);
    }

    this.instances.set(key, instance);
  }

  get<T>(name: string | ClassType<T>): T {
    const key: RegistryKey = name;

    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }

    const ClassType = this.registry.get(key);
    if (!ClassType) {
      const keyName = typeof key === "string" ? key : key.name;
      throw new Error(`Dependency '${keyName}' is not registered`);
    }

    const injectMetadata = getInjectMetadata(ClassType);
    let instance: any;

    if (injectMetadata) {
      const paramTypes =
        Reflect.getMetadata("design:paramtypes", ClassType) || [];
      const args: any[] = [];

      for (let i = 0; i < paramTypes.length; i++) {
        const dependencyMetadata = injectMetadata[i];
        if (dependencyMetadata) {
          if (shouldUseTypeResolution(dependencyMetadata)) {
            const paramType = paramTypes[i];
            const foundKey = this.findByType(paramType);
            if (foundKey) {
              args[i] = this.get(foundKey);
            } else {
              // Fallback to direct type resolution (old behavior)
              args[i] = this.get(paramType);
            }
          } else {
            args[i] = this.get(dependencyMetadata as string);
          }
        }
      }

      instance = new ClassType(...args);
    } else {
      instance = new ClassType();
    }

    return instance as T;
  }

  has(name: string | ClassType): boolean {
    return this.registry.has(name) || this.instances.has(name);
  }

  clear(name: string | ClassType): void {
    this.registry.delete(name);
    this.instances.delete(name);
  }

  clearAll(): void {
    this.registry.clear();
    this.instances.clear();
  }

  getRegisteredNames(): Array<string | ClassType> {
    return Array.from(
      new Set([...this.registry.keys(), ...this.instances.keys()]),
    );
  }

  private findByType<T>(type: ClassType<T>): RegistryKey | null {
    const matches: RegistryKey[] = [];

    // Check registry
    for (const [key, registeredType] of this.registry.entries()) {
      if (registeredType === type) {
        matches.push(key);
      }
    }

    // Check instances
    for (const [key, instance] of this.instances.entries()) {
      if (instance.constructor === type) {
        matches.push(key);
      }
    }

    if (matches.length === 0) {
      return null;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    throw new AmbiguousDependencyError(type.name, matches);
  }
}
