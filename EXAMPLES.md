# Dependency Injection Examples

## Type-Based Resolution (Automatic)

The `@Inject()` decorator parameter is optional. When omitted, the container uses TypeScript's reflection metadata to automatically resolve dependencies by their type.

```typescript
import { container, Inject } from '@filipgorny/di'

class DatabaseService {
  connect() {
    console.log('Connected to database')
  }
}

class UserRepository {
  constructor(
    @Inject() private db: DatabaseService  // No parameter needed!
  ) {}

  findAll() {
    this.db.connect()
    return []
  }
}

// Register by class type
container.register(DatabaseService)
container.register(UserRepository)

// Resolve by class type
const userRepo = container.get(UserRepository)
userRepo.findAll()
```

## String-Based Resolution (Manual)

You can also specify a string name for dependencies that need explicit registration:

```typescript
import { container, Inject } from '@filipgorny/di'

interface LogStrategy {
  log(message: string): void
}

class ConsoleLogStrategy implements LogStrategy {
  log(message: string) {
    console.log(message)
  }
}

class Logger {
  constructor(
    @Inject('logStrategy') private strategy: LogStrategy
  ) {}

  info(message: string) {
    this.strategy.log(message)
  }
}

// Register with string name
container.registerInstance('logStrategy', new ConsoleLogStrategy())
container.register('logger', Logger)

// Resolve by string name
const logger = container.get<Logger>('logger')
logger.info('Hello world')
```

## Mixed Approach

You can combine both approaches:

```typescript
class ApiService {
  constructor(
    @Inject() private db: DatabaseService,     // Type-based
    @Inject('config') private config: any      // String-based
  ) {}
}

container.register(DatabaseService)
container.registerInstance('config', { apiUrl: 'https://api.example.com' })
container.register(ApiService)

const api = container.get(ApiService)
```

## Important Notes

1. **Decorators must be enabled** in `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "experimentalDecorators": true,
       "emitDecoratorMetadata": true
     }
   }
   ```

2. **Import reflect-metadata** at the entry point:
   ```typescript
   import 'reflect-metadata'
   ```

3. **Interfaces don't exist at runtime** - use string names for interface-based dependencies, or use abstract classes instead.

4. **Type-based registration** only works with concrete classes that can be instantiated.
