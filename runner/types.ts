export interface GitRunner {
  log(args: { repoPath: string; from: string; to: string }): string;
  diffStat(args: { repoPath: string; from: string; to: string }): string;
  tagAnnotation(args: { repoPath: string; tag: string }): string;
  latestTags(args: { repoPath: string }): string[];
  initialCommit(args: { repoPath: string }): string;
}

export interface LlmRunner {
  complete(prompt: string): Promise<string>;
}

export interface RunDraftChangelogOptions {
  from?: string;
  to?: string;
  repoPath: string;
  skillPath: string;
  git: GitRunner;
  llm: LlmRunner;
}

export interface PostMeta {
  status: 'draft' | 'approved' | 'scheduled' | 'published';
  command: string;
  from: string;
  to: string;
  createdAt: string;
}

export interface RunnerResult {
  postFolder: string;
  meta: PostMeta;
  llmResponse: string;
}
