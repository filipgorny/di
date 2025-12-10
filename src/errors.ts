export class AmbiguousDependencyError extends Error {
  constructor(typeName: string, matches: Array<string | Function>) {
    const matchNames = matches.map((m) => (typeof m === "string" ? m : m.name));
    super(
      `Ambiguous dependency: Found ${matches.length} registrations for type '${typeName}': ${matchNames.join(", ")}. ` +
        `Please specify which one to use by providing a key to @Inject()`,
    );
    this.name = "AmbiguousDependencyError";
  }
}
