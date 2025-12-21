import "reflect-metadata";
import * as fs from "fs";
import * as path from "path";
import { Container } from "./container";

export interface ContainerConfig {
  registrations: Registration[];
  instances?: InstanceRegistration[];
}

export interface Registration {
  name: string;
  module: string;
  export?: string;
}

export interface InstanceRegistration {
  name: string;
  module?: string;
  export?: string;
  factory?: string;
  inject?: string[];
}

/**
 * Creates a container from a JSON configuration file
 * @param configFilePath Path to the JSON configuration file (relative or absolute)
 * @param baseDir Base directory for resolving module paths (defaults to the directory of the config file)
 * @returns Configured Container instance
 */
export async function createContainerFromConfig(
  configFilePath: string,
  baseDir?: string,
): Promise<Container> {
  const container = new Container();

  // Resolve the config file path
  const absoluteConfigPath = path.isAbsolute(configFilePath)
    ? configFilePath
    : path.resolve(process.cwd(), configFilePath);

  // Read and parse the config file
  const configContent = fs.readFileSync(absoluteConfigPath, "utf-8");
  const config: ContainerConfig = JSON.parse(configContent);

  // Determine base directory for module resolution
  const resolveBase = baseDir || path.dirname(absoluteConfigPath);

  // Register classes
  if (config.registrations) {
    for (const registration of config.registrations) {
      const classType = await loadModule(
        registration.module,
        registration.export,
        resolveBase,
      );
      container.register(registration.name, classType);
    }
  }

  // Register instances
  if (config.instances) {
    for (const instanceReg of config.instances) {
      let instance: any;

      if (instanceReg.factory) {
        // Load the factory function from the module
        const factory = await loadModule(
          instanceReg.module!,
          instanceReg.export || instanceReg.factory,
          resolveBase,
        );

        if (typeof factory !== "function") {
          throw new Error(
            `Factory '${instanceReg.factory}' is not a function in module '${instanceReg.module}'`,
          );
        }

        // Resolve dependencies from the container based on the inject array
        const dependencies = instanceReg.inject
          ? instanceReg.inject.map((dep) => container.get(dep))
          : [];

        instance = factory(...dependencies);
      } else {
        // Load and instantiate the class
        const module = await loadModule(
          instanceReg.module!,
          instanceReg.export,
          resolveBase,
        );

        // Resolve dependencies from the container based on the inject array
        const dependencies = instanceReg.inject
          ? instanceReg.inject.map((dep) => container.get(dep))
          : [];

        instance = new module(...dependencies);
      }

      container.registerInstance(instanceReg.name, instance);
    }
  }

  return container;
}

/**
 * Load a module and return the specified export or default export
 */
async function loadModule(
  modulePath: string,
  exportName: string | undefined,
  baseDir: string,
): Promise<any> {
  // Resolve the module path
  const resolvedPath = modulePath.startsWith(".")
    ? path.resolve(baseDir, modulePath)
    : modulePath;

  // Dynamically import the module
  const module = await import(resolvedPath);

  // Return the specified export or default
  if (exportName) {
    if (!module[exportName]) {
      throw new Error(
        `Export '${exportName}' not found in module '${modulePath}'`,
      );
    }
    return module[exportName];
  }

  // Try to return default export, or the module itself
  return module.default || module;
}

/**
 * Synchronous version of createContainerFromConfig
 * Note: This uses require() instead of dynamic import and may not work with ES modules
 */
export function createContainerFromConfigSync(
  configFilePath: string,
  baseDir?: string,
): Container {
  const container = new Container();

  // Resolve the config file path
  const absoluteConfigPath = path.isAbsolute(configFilePath)
    ? configFilePath
    : path.resolve(process.cwd(), configFilePath);

  // Read and parse the config file
  const configContent = fs.readFileSync(absoluteConfigPath, "utf-8");
  const config: ContainerConfig = JSON.parse(configContent);

  // Determine base directory for module resolution
  const resolveBase = baseDir || path.dirname(absoluteConfigPath);

  // Register classes
  if (config.registrations) {
    for (const registration of config.registrations) {
      const classType = loadModuleSync(
        registration.module,
        registration.export,
        resolveBase,
      );
      container.register(registration.name, classType);
    }
  }

  // Register instances
  if (config.instances) {
    for (const instanceReg of config.instances) {
      let instance: any;

      if (instanceReg.factory) {
        // Load the factory function from the module
        const factory = loadModuleSync(
          instanceReg.module!,
          instanceReg.export || instanceReg.factory,
          resolveBase,
        );

        if (typeof factory !== "function") {
          throw new Error(
            `Factory '${instanceReg.factory}' is not a function in module '${instanceReg.module}'`,
          );
        }

        // Resolve dependencies from the container based on the inject array
        const dependencies = instanceReg.inject
          ? instanceReg.inject.map((dep) => container.get(dep))
          : [];

        instance = factory(...dependencies);
      } else {
        // Load and instantiate the class
        const module = loadModuleSync(
          instanceReg.module!,
          instanceReg.export,
          resolveBase,
        );

        // Resolve dependencies from the container based on the inject array
        const dependencies = instanceReg.inject
          ? instanceReg.inject.map((dep) => container.get(dep))
          : [];

        instance = new module(...dependencies);
      }

      container.registerInstance(instanceReg.name, instance);
    }
  }

  return container;
}

/**
 * Synchronous module loader using require()
 */
function loadModuleSync(
  modulePath: string,
  exportName: string | undefined,
  baseDir: string,
): any {
  // Resolve the module path
  const resolvedPath = modulePath.startsWith(".")
    ? path.resolve(baseDir, modulePath)
    : modulePath;

  // Use require to load the module
  const module = require(resolvedPath);

  // Return the specified export or default
  if (exportName) {
    if (!module[exportName]) {
      throw new Error(
        `Export '${exportName}' not found in module '${modulePath}'`,
      );
    }
    return module[exportName];
  }

  // Try to return default export, or the module itself
  return module.default || module;
}
