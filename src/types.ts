export interface MidasClientOptions {
  /** API base URL. Defaults to https://api.midascode.net */
  baseUrl?: string;
  /** Request timeout in milliseconds. Defaults to 120000 (2 minutes) */
  timeout?: number;
}

export interface GenerateOptions {
  /** Model to use for generation */
  model?: string;
  /** Whether to include context from previous messages */
  sessionId?: string;
}

export interface Usage {
  creditsUsed: number;
  creditsRemaining: number;
}

export interface GenerateResult {
  /** Unique response ID */
  id: string;
  /** Generated code content */
  content: string;
  /** Model used */
  model: string;
  /** Credit usage */
  usage: Usage;
}

export interface ReviewOptions {
  /** Filename for context */
  filename?: string;
  /** Focus areas: "security" | "performance" | "style" | "bugs" */
  focus?: string[];
}

export interface ReviewFinding {
  line: number;
  severity: "error" | "warning" | "info";
  message: string;
}

export interface ReviewResult {
  /** List of findings */
  findings: ReviewFinding[];
  /** Summary of the review */
  summary: string;
  /** Credit usage */
  usage: Usage;
}
