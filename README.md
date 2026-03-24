# Midas Code SDK

Official TypeScript/JavaScript SDK for the [Midas Code](https://midascode.net) API.

## Installation

```bash
npm install @midascode/sdk
```

## Quick Start

```typescript
import { MidasClient } from "@midascode/sdk";

const midas = new MidasClient("midas_your_key_here");

// Generate code
const result = await midas.generate("Create a REST API with Express.js");
console.log(result.content);

// Stream code generation
const stream = await midas.stream("Build a CLI tool in Node.js");
for await (const token of stream) {
  process.stdout.write(token);
}
```

## API Reference

### `new MidasClient(apiKey, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `apiKey` | `string` | Your Midas Code API key |
| `options.baseUrl` | `string` | API base URL (default: `https://api.midascode.net`) |
| `options.timeout` | `number` | Request timeout in ms (default: `120000`) |

### `midas.generate(prompt, options?)`

Generate code from a prompt. Returns a `Promise<GenerateResult>`.

```typescript
const result = await midas.generate("Create a user auth system", {
  model: "midas-2",
});

console.log(result.content);        // Generated code
console.log(result.usage.creditsUsed);
console.log(result.usage.creditsRemaining);
```

### `midas.stream(prompt, options?)`

Stream code generation token-by-token. Returns an `AsyncIterable<string>`.

```typescript
const stream = await midas.stream("Build a React dashboard");
for await (const token of stream) {
  process.stdout.write(token);
}
```

### `midas.review(code, options?)`

Submit code for AI-powered review.

```typescript
const review = await midas.review(sourceCode, {
  filename: "server.ts",
});
console.log(review.findings);
```

## Links

- [Documentation](https://midascode.net/docs)
- [Examples](https://github.com/MIDAS-CODE-NET/examples)
- [Pricing](https://midascode.net/pricing)

## License

MIT
