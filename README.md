# @filipgorny/di

Lightweight dependency injection container for managing application dependencies.

## Features

- 🎯 **Simple API** - Just `register()` and `get()`
- 🔒 **Singleton support** - Control instance lifecycle
- 📦 **Type-safe** - Full TypeScript support
- 🧪 **Testable** - Create isolated containers for testing
- 🪶 **Lightweight** - No external dependencies (except @filipgorny/types)

## Installation

```bash
pnpm add @filipgorny/di
```

## Usage

### Basic Usage

```typescript
import { container } from '@filipgorny/di'

// Define your classes
class Logger {
  log(message: string) {
    console.log(message)
  }
}

class UserService {
  constructor() {
    this.logger = container.get<Logger>('logger')
  }
}

// Register dependencies
container.register('logger', Logger)
container.register('userService', UserService)

// Get instances
const userService = container.get<UserService>('userService')
```

### Singleton vs Transient

```typescript
// Singleton (default) - same instance every time
container.register('logger', Logger) // singleton=true by default

const logger1 = container.get<Logger>('logger')
const logger2 = container.get<Logger>('logger')
console.log(logger1 === logger2) // true

// Transient - new instance every time
container.register('request', Request, false) // singleton=false

const req1 = container.get<Request>('request')
const req2 = container.get<Request>('request')
console.log(req1 === req2) // false
```

### Register Instances Directly

```typescript
// Create instance with custom configuration
const logger = new Logger({ level: 'debug', format: 'json' })

// Register the instance
container.registerInstance('logger', logger)

// Get the same instance
const sameLogger = container.get<Logger>('logger')
```

### Multiple Containers (Testing)

```typescript
import { createContainer } from '@filipgorny/di'

// Production container
const prodContainer = createContainer()
prodContainer.register('logger', Logger)
prodContainer.register('db', PostgresDatabase)

// Test container with mocks
const testContainer = createContainer()
testContainer.register('logger', MockLogger)
testContainer.register('db', InMemoryDatabase)
```

### Check if Registered

```typescript
if (container.has('logger')) {
  const logger = container.get<Logger>('logger')
}
```

### Clear Dependencies

```typescript
// Clear specific dependency
container.clear('logger')

// Clear all
container.clearAll()
```

### List Registered Dependencies

```typescript
const deps = container.getRegisteredNames()
console.log(deps) // ['logger', 'userService', 'db']
```

## API

### `register<T>(name: string, classType: ClassType<T>, singleton?: boolean): void`

Register a class with the container.

- `name` - Unique identifier
- `classType` - The class to register
- `singleton` - If true, creates only one instance (default: true)

### `registerInstance<T>(name: string, instance: T): void`

Register a pre-created instance as a singleton.

- `name` - Unique identifier
- `instance` - The instance to register

### `get<T>(name: string): T`

Get an instance of a registered dependency.

- `name` - The name of the dependency
- Returns the dependency instance (throws if not registered)

### `has(name: string): boolean`

Check if a dependency is registered.

### `clear(name: string): void`

Remove a specific dependency from the container.

### `clearAll(): void`

Remove all dependencies from the container.

### `getRegisteredNames(): string[]`

Get a list of all registered dependency names.

## Patterns

### Service Locator Pattern

```typescript
// services/base-service.ts
export class BaseService {
  protected container: Container

  constructor(container: Container) {
    this.container = container
  }
}

// services/user-service.ts
export class UserService extends BaseService {
  async getUser(id: string) {
    const db = this.container.get<Database>('database')
    const logger = this.container.get<Logger>('logger')

    logger.info(`Fetching user ${id}`)
    return db.findUser(id)
  }
}
```

### Composition Root

```typescript
// src/container.ts
import { container } from '@filipgorny/di'
import { Logger } from './logger'
import { Database } from './database'
import { UserService } from './services/user-service'

export function setupContainer() {
  // Register infrastructure
  container.register('logger', Logger)
  container.register('database', Database)

  // Register services
  container.register('userService', UserService)

  return container
}

// src/index.ts
import { setupContainer } from './container'

const container = setupContainer()
const app = express()

// Now use container throughout your app
const userService = container.get<UserService>('userService')
```

## Best Practices

1. **Register early** - Set up your container at application startup
2. **One container** - Use a single container per application (except in tests)
3. **Named constants** - Use constants for dependency names to avoid typos
4. **Type safety** - Always use generics when calling `get<T>()`
5. **Avoid service locator** - Prefer constructor injection when possible

## Example: Dependency Names

```typescript
// constants/di-names.ts
export const DI = {
  LOGGER: 'logger',
  DATABASE: 'database',
  USER_SERVICE: 'userService',
  LLM_PROVIDER: 'llmProvider'
} as const

// Usage
import { DI } from './constants/di-names'

container.register(DI.LOGGER, Logger)
const logger = container.get<Logger>(DI.LOGGER)
```

## Comparison with Other DI Libraries

| Feature | @filipgorny/di | InversifyJS | NestJS |
|---------|-----------|-------------|---------|
| Learning curve | Low | Medium | High |
| Decorators | No | Yes | Yes |
| Size | ~1KB | ~50KB | Full framework |
| Best for | Learning, simple apps | Large apps | Enterprise apps |
