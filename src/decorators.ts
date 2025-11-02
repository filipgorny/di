const INJECT_METADATA_KEY = Symbol('inject')
const USE_TYPE_RESOLUTION = Symbol('useTypeResolution')

export interface InjectMetadata {
  [parameterIndex: number]: string | symbol
}

export function Inject(name?: string) {
  return function (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingMetadata: InjectMetadata = Reflect.getMetadata(INJECT_METADATA_KEY, target) || {}

    if (name) {
      existingMetadata[parameterIndex] = name
    } else {
      existingMetadata[parameterIndex] = USE_TYPE_RESOLUTION
    }

    Reflect.defineMetadata(INJECT_METADATA_KEY, existingMetadata, target)
  }
}

export function getInjectMetadata(target: any): InjectMetadata | undefined {
  return Reflect.getMetadata(INJECT_METADATA_KEY, target)
}

export function shouldUseTypeResolution(metadata: string | symbol): boolean {
  return metadata === USE_TYPE_RESOLUTION
}
