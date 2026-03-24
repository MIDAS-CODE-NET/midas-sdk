import type {
  MidasClientOptions,
  GenerateOptions,
  GenerateResult,
  ReviewOptions,
  ReviewResult,
} from "./types";

const DEFAULT_BASE_URL = "https://api.midascode.net";
const DEFAULT_TIMEOUT = 120_000;

export class MidasClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(apiKey: string, options: MidasClientOptions = {}) {
    if (!apiKey) {
      throw new Error("API key is required. Get one at https://midascode.net/dashboard/keys");
    }
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Generate code from a prompt.
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const res = await this.request("/api/agent/prompt", {
      prompt,
      ...options,
    });
    return res as GenerateResult;
  }

  /**
   * Stream code generation token-by-token.
   * Returns an async iterable of string tokens.
   */
  async stream(prompt: string, options: GenerateOptions = {}): Promise<AsyncIterable<string>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const res = await fetch(`${this.baseUrl}/api/agent/prompt`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ prompt, stream: true, ...options }),
      signal: controller.signal,
    });

    if (!res.ok) {
      clearTimeout(timeoutId);
      const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
      throw new Error(err.message ?? `API error: ${res.status}`);
    }

    const reader = res.body?.getReader();
    if (!reader) {
      clearTimeout(timeoutId);
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();

    return {
      [Symbol.asyncIterator]() {
        let buffer = "";
        let done = false;

        return {
          async next(): Promise<IteratorResult<string>> {
            if (done) return { done: true, value: undefined };

            while (true) {
              const result = await reader.read();
              if (result.done) {
                clearTimeout(timeoutId);
                done = true;
                return { done: true, value: undefined };
              }

              buffer += decoder.decode(result.value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") {
                    clearTimeout(timeoutId);
                    done = true;
                    return { done: true, value: undefined };
                  }

                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.token) {
                      return { done: false, value: parsed.token };
                    }
                  } catch {
                    // Skip malformed lines
                  }
                }
              }
            }
          },
        };
      },
    };
  }

  /**
   * Submit code for AI-powered review.
   */
  async review(code: string, options: ReviewOptions = {}): Promise<ReviewResult> {
    const prompt = this.buildReviewPrompt(code, options);
    const res = await this.request("/api/agent/prompt", { prompt });
    return this.parseReviewResponse(res.content);
  }

  private async request(path: string, body: Record<string, unknown>): Promise<GenerateResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message ?? `API error: ${res.status}`);
      }

      return (await res.json()) as GenerateResult;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildReviewPrompt(code: string, options: ReviewOptions): string {
    const filename = options.filename ?? "code";
    const focus = options.focus?.join(", ") ?? "bugs, security, performance, style";

    return `Review the following code from ${filename}. Focus on: ${focus}.
Format findings as JSON array: [{"line": number, "severity": "error"|"warning"|"info", "message": "description"}]
Also provide a brief summary.

Code:
\`\`\`
${code}
\`\`\``;
  }

  private parseReviewResponse(content: string): ReviewResult {
    try {
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      const findings = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      const summary = content.replace(/\[[\s\S]*?\]/, "").trim();

      return {
        findings,
        summary,
        usage: { creditsUsed: 1, creditsRemaining: 0 },
      };
    } catch {
      return {
        findings: [],
        summary: content,
        usage: { creditsUsed: 1, creditsRemaining: 0 },
      };
    }
  }
}
