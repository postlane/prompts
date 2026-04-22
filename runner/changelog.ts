import { readFile } from 'node:fs/promises';
import type { RunDraftChangelogOptions, RunnerResult } from './types.js';

export class ChangelogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChangelogError';
  }
}

function versionSlug(tag: string): string {
  return tag.replace(/\./g, '');
}

function datestamp(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

async function readSkillFile(skillPath: string): Promise<string> {
  try {
    return await readFile(skillPath, 'utf8');
  } catch {
    return '';
  }
}

const GIT_LOG_MAX_BYTES = 40_000;
const GIT_LOG_MAX_COMMITS = 30;

function truncateGitLog(gitLog: string): string {
  if (gitLog.length <= GIT_LOG_MAX_BYTES) {
    return gitLog;
  }

  const lines = gitLog.split('\n');
  const totalCommits = lines.length;
  const recentLines = lines.slice(-GIT_LOG_MAX_COMMITS);
  const truncatedLog = recentLines.join('\n');

  const note = `[Note: git log truncated to most recent ${GIT_LOG_MAX_COMMITS} commits. Full history had ${totalCommits} commits.]`;
  return `${note}\n${truncatedLog}`;
}

function resolveRange(
  from: string | undefined,
  to: string | undefined,
  tags: string[],
  initialCommit: string,
): { from: string; to: string } {
  if (from !== undefined && to !== undefined) {
    return { from, to };
  }

  if (tags.length === 0) {
    throw new ChangelogError(
      'No tags found. Tag your release first with `git tag v0.1.0`.',
    );
  }

  if (tags.length === 1) {
    return { from: initialCommit, to: tags[0] as string };
  }

  return { from: tags.at(-2) as string, to: tags.at(-1) as string };
}

export async function runDraftChangelog(
  options: RunDraftChangelogOptions,
): Promise<RunnerResult> {
  const { repoPath, skillPath, git, llm } = options;

  const tags = git.latestTags({ repoPath });
  const initialCommit = git.initialCommit({ repoPath });

  const range = resolveRange(options.from, options.to, tags, initialCommit);

  const rawGitLog = git.log({ repoPath, from: range.from, to: range.to });
  const gitLog = truncateGitLog(rawGitLog);
  const diffStat = git.diffStat({ repoPath, from: range.from, to: range.to });
  const tagAnnotation = git.tagAnnotation({ repoPath, tag: range.to });

  const skillContent = await readSkillFile(skillPath);

  const prompt = [
    skillContent,
    `Range: ${range.from}..${range.to}`,
    `Commits:\n${gitLog}`,
    `Changes:\n${diffStat}`,
    tagAnnotation ? `Tag annotation:\n${tagAnnotation}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const llmResponse = await llm.complete(prompt);

  if (llmResponse.length > 50_000) {
    throw new ChangelogError(
      `LLM response exceeded maximum length (${llmResponse.length} chars). The model may have hallucinated. Try again.`,
    );
  }

  const slug = versionSlug(range.to);
  const postFolder = `${datestamp()}-${slug}-changelog`;

  return {
    postFolder,
    meta: {
      status: 'draft',
      command: 'draft-changelog',
      from: range.from,
      to: range.to,
      createdAt: new Date().toISOString(),
    },
    llmResponse,
  };
}
