# @filipgorny/di

Lightweight dependency injection container for managing application dependencies.

## Features

- 🎯 **Simple API** - Just `register()` and `get()`
- ⚛️ **React Hook** - `useContainer()` for React components
- 📦 **Type-safe** - Full TypeScript support
- 🧪 **Testable** - Create isolated containers for testing
- 🪶 **Lightweight** - Minimal dependencies

## Installation

```bash
pnpm add @filipgorny/di
```

## Usage

```typescript
import { createContainer } from "@filipgorny/di";
import { Inject } from "@filipgorny/di";

// services/logger.ts
export class Logger {
  log(message: string) {
    console.log(message);
  }
}

// services/user-service.ts
export class UserService {
  constructor(@Inject() private logger: Logger) {}

  doSomething() {
    this.logger.log("Doing something");
  }
}

// app.ts
export class App {
  constructor(@Inject() private userService: UserService) {}

  run() {
    this.userService.doSomething();
  }
}

// container.ts
const container = createContainer();

// Register dependencies
container.register("logger", Logger);
container.register("userService", UserService);
container.register("app", App);

// Get the app instance
const app = container.get<App>("app");
app.run();
```

### Register Instances Directly

```typescript
const container = createContainer();

// Create instance with custom configuration
const logger = new Logger({ level: "debug", format: "json" });

// Register the instance
container.registerInstance("logger", logger);

// Get the same instance
const sameLogger = container.get<Logger>("logger");
```

### React Hook

```typescript
import { useContainer } from "@filipgorny/di";

function MyComponent({ container }: { container: Container }) {
  const logger = useContainer(container, "logger");
  const userService = useContainer(container, UserService);

  // Instances are memoized per render
  return <div>...</div>;
}
```

### Check if Registered

```typescript
const container = createContainer();

if (container.has("logger")) {
  const logger = container.get<Logger>("logger");
}
```

### Clear Dependencies

```typescript
const container = createContainer();

// Clear specific dependency
container.clear("logger");

// Clear all
container.clearAll();
```

### List Registered Dependencies

```typescript
const container = createContainer();

const deps = container.getRegisteredNames();
console.log(deps); // ['logger', 'userService', 'db']
```

## API

### `register<T>(name: string, classType: ClassType<T>): void`

Register a class with the container.

- `name` - Unique identifier
- `classType` - The class to register

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

### `useContainer<T>(container: Container, nameOrClass: string | ClassType<T>): T`

React hook to get dependencies from the container. Instances are memoized to prevent unnecessary re-creation.

## Patterns

### Constructor Injection with Decorators

```typescript
import { Inject } from "@filipgorny/di";

// services/user-service.ts
export class UserService {
  constructor(
    @Inject() private database: Database,
    @Inject() private logger: Logger,
  ) {}

  async getUser(id: string) {
    this.logger.info(`Fetching user ${id}`);
    return this.database.findUser(id);
  }
}
```



## Best Practices

1. **Register early** - Set up your container at application startup
2. **Composition root** - Use the container only in the composition root, never access it globally
3. **Named constants** - Use constants for dependency names to avoid typos
4. **Type safety** - Always use generics when calling `get<T>()`
5. **Use constructor injection** - Prefer @Inject() decorator over manual container.get()
6. **Avoid service locator** - Never call container.get() inside classes

## Example: Dependency Names

```typescript
// constants/di-names.ts
export const DI = {
  LOGGER: "logger",
  DATABASE: "database",
  USER_SERVICE: "userService",
  LLM_PROVIDER: "llmProvider",
} as const;

// Usage
import { DI } from "./constants/di-names";
import { createContainer } from "@filipgorny/di";

const container = createContainer();
container.register(DI.LOGGER, Logger);
const logger = container.get<Logger>(DI.LOGGER);
```

## Comparison with Other DI Libraries

| Feature        | @filipgorny/di        | InversifyJS | NestJS          |
| -------------- | --------------------- | ----------- | --------------- |
| Learning curve | Low                   | Medium      | High            |
| React hooks    | Yes                   | No          | No              |
| Decorators     | Yes                   | Yes         | Yes             |
| Size           | ~2KB                  | ~50KB       | Full framework  |
| Best for       | Learning, simple apps | Large apps  | Enterprise apps |
