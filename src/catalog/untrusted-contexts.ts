export interface UntrustedContextMatch {
  expression: string;
  reason: string;
  confidence: "medium" | "high";
}

const untrustedPatterns: Array<{
  label: string;
  pattern: RegExp;
  reason: string;
  confidence: "medium" | "high";
}> = [
  {
    label: "github.event.issue.title",
    pattern: /github\.event\.issue\.title\b/g,
    reason: "Issue titles can be supplied by untrusted users.",
    confidence: "high",
  },
  {
    label: "github.event.issue.body",
    pattern: /github\.event\.issue\.body\b/g,
    reason: "Issue bodies can contain prompt-injection instructions.",
    confidence: "high",
  },
  {
    label: "github.event.pull_request.title",
    pattern: /github\.event\.pull_request\.title\b/g,
    reason: "Pull request titles can be supplied by contributors.",
    confidence: "high",
  },
  {
    label: "github.event.pull_request.body",
    pattern: /github\.event\.pull_request\.body\b/g,
    reason: "Pull request bodies can contain untrusted instructions.",
    confidence: "high",
  },
  {
    label: "github.event.comment.body",
    pattern: /github\.event\.comment\.body\b/g,
    reason: "Issue and PR comments can be supplied by untrusted users.",
    confidence: "high",
  },
  {
    label: "github.event.review.body",
    pattern: /github\.event\.review\.body\b/g,
    reason: "Review bodies may include untrusted contributor text.",
    confidence: "high",
  },
  {
    label: "github.event.review_comment.body",
    pattern: /github\.event\.review_comment\.body\b/g,
    reason: "Review comments may include untrusted contributor text.",
    confidence: "high",
  },
  {
    label: "github.event.discussion.body",
    pattern: /github\.event\.discussion\.body\b/g,
    reason: "Discussion bodies may be supplied by untrusted users.",
    confidence: "high",
  },
  {
    label: "github.event.discussion_comment.body",
    pattern: /github\.event\.discussion_comment\.body\b/g,
    reason: "Discussion comments may be supplied by untrusted users.",
    confidence: "high",
  },
  {
    label: "github.event.head_commit.message",
    pattern: /github\.event\.head_commit\.message\b/g,
    reason: "Commit messages can contain attacker-controlled text.",
    confidence: "high",
  },
  {
    label: "github.event.commits.*.message",
    pattern: /github\.event\.commits(?:\.\*|\[[^\]]+\])?\.message\b/g,
    reason: "Commit messages can contain attacker-controlled text.",
    confidence: "high",
  },
  {
    label: "github.event.pull_request.head.ref",
    pattern: /github\.event\.pull_request\.head\.ref\b/g,
    reason: "Pull request head refs can be attacker-controlled branch names.",
    confidence: "high",
  },
  {
    label: "github.event.pull_request.head.sha",
    pattern: /github\.event\.pull_request\.head\.sha\b/g,
    reason: "Pull request head SHAs can point at contributor-controlled code.",
    confidence: "high",
  },
  {
    label: "github.event.pull_request.head.repo.full_name",
    pattern: /github\.event\.pull_request\.head\.repo\.full_name\b/g,
    reason: "Pull request head repositories can be contributor-controlled forks.",
    confidence: "high",
  },
  {
    label: "github.event.sender.login",
    pattern: /github\.event\.sender\.login\b/g,
    reason: "Sender login values are external identity data and should not become instructions.",
    confidence: "medium",
  },
  {
    label: "inputs.*",
    pattern: /\binputs\.[A-Za-z0-9_-]+\b/g,
    reason: "workflow_dispatch inputs may be user-supplied unless the workflow constrains callers.",
    confidence: "medium",
  },
];

export function findUntrustedContexts(value: string): UntrustedContextMatch[] {
  const matches: UntrustedContextMatch[] = [];
  for (const candidate of untrustedPatterns) {
    if (candidate.pattern.test(value)) {
      matches.push({
        expression: candidate.label,
        reason: candidate.reason,
        confidence: candidate.confidence,
      });
    }
    candidate.pattern.lastIndex = 0;
  }
  return matches;
}
