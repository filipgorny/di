import 'reflect-metadata'
import { ClassType } from '@filipgorny/types'
import { getInjectMetadata, shouldUseTypeResolution } from './decorators'

type RegistryKey = string | ClassType

export class Container {
  private registry = new Map<RegistryKey, ClassType>()
  private instances = new Map<RegistryKey, any>()
  private singletons = new Set<RegistryKey>()

  register<T>(name: string | ClassType<T>, classType?: ClassType<T>, singleton: boolean = true): void {
    let key: RegistryKey
    let type: ClassType<T>

    if (typeof name === 'string') {
      if (!classType) {
        throw new Error('ClassType is required when registering with a string name')
      }
      key = name
      type = classType
    } else {
      key = name
      type = name
    }

    if (this.registry.has(key)) {
      const keyName = typeof key === 'string' ? key : key.name
      throw new Error(`Dependency '${keyName}' is already registered`)
    }

    this.registry.set(key, type)

    if (singleton) {
      this.singletons.add(key)
    }
  }

  registerInstance<T>(name: string | ClassType<T>, instance: T): void {
    const key: RegistryKey = name

    if (this.instances.has(key)) {
      const keyName = typeof key === 'string' ? key : key.name
      throw new Error(`Instance '${keyName}' is already registered`)
    }

    this.instances.set(key, instance)
    this.singletons.add(key)
  }

  get<T>(name: string | ClassType<T>): T {
    const key: RegistryKey = name

    if (this.instances.has(key)) {
      return this.instances.get(key) as T
    }

    const ClassType = this.registry.get(key)
    if (!ClassType) {
      const keyName = typeof key === 'string' ? key : key.name
      throw new Error(`Dependency '${keyName}' is not registered`)
    }

    const injectMetadata = getInjectMetadata(ClassType)
    let instance: any

    if (injectMetadata) {
      const paramTypes = Reflect.getMetadata('design:paramtypes', ClassType) || []
      const args: any[] = []

      for (let i = 0; i < paramTypes.length; i++) {
        const dependencyMetadata = injectMetadata[i]
        if (dependencyMetadata) {
          if (shouldUseTypeResolution(dependencyMetadata)) {
            const paramType = paramTypes[i]
            args[i] = this.get(paramType)
          } else {
            args[i] = this.get(dependencyMetadata as string)
          }
        }
      }

      instance = new ClassType(...args)
    } else {
      instance = new ClassType()
    }

    if (this.singletons.has(key)) {
      this.instances.set(key, instance)
    }

    return instance as T
  }

  has(name: string | ClassType): boolean {
    return this.registry.has(name) || this.instances.has(name)
  }

  clear(name: string | ClassType): void {
    this.registry.delete(name)
    this.instances.delete(name)
    this.singletons.delete(name)
  }

  clearAll(): void {
    this.registry.clear()
    this.instances.clear()
    this.singletons.clear()
  }

  getRegisteredNames(): Array<string | ClassType> {
    return Array.from(new Set([
      ...this.registry.keys(),
      ...this.instances.keys()
    ]))
  }
}
