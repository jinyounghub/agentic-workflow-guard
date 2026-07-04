# Comparison With Existing Tools

`agentic-workflow-guard` is intentionally narrow. It complements existing tools rather than replacing them.

| Tool or research | What it checks | Overlap | What we will not do | Differentiation |
| --- | --- | --- | --- | --- |
| zizmor | Static analysis for GitHub Actions security issues such as template injection, credential leakage, permissions, and ref confusion. | Some overlap on permissions, pinning, and pwn-request style workflow risk. | We will not become a full general-purpose GitHub Actions security scanner. | We correlate AI actions, prompt inputs, untrusted GitHub event contexts, and agent-derived outputs. |
| poutine | Supply-chain scanner for build pipelines, including GitHub Actions and GitLab CI/CD misconfigurations. | Some overlap on CI/CD security posture and workflow misconfiguration. | We will not scan entire organizations or produce broad CI/CD inventory. | We focus on Agentic Workflow Injection paths inside AI-powered workflows. |
| actionlint | Syntax, schema, expression, action metadata, and workflow semantic checks. | It understands GitHub Actions syntax more deeply than this MVP. | We will not replace actionlint's parser or expression type checker. | We add AI-specific threat modeling that actionlint does not attempt. |
| Snyk agent-scan | AI agent, MCP server, skill, prompt/resource, and configuration scanning. | Both projects care about AI agent security. | We will not scan MCP internals, local desktop agent config, or skill packages. | We inspect GitHub Actions workflow boundaries and CI permissions. |
| Ramparts | MCP server and AI agent skill scanner for indirect attacks, tool poisoning, secret leakage, and command injection. | Both look for indirect AI attack surfaces. | We will not analyze MCP server behavior or tool descriptions. | We focus on workflow YAML, GitHub event context, and CI sinks. |
| AgentLint / AgentLinter | AGENTS.md, CLAUDE.md, Cursor rules, copilot instructions, and agent configuration quality/security. | Both touch AI development workflows. | We will not lint agent instruction files. | We examine the GitHub Actions workflow that executes agents. |
| PR-Agent | AI-assisted PR review and automation. | It may run in GitHub workflows. | We will not review code changes or generate PR review comments. | We can scan workflows that run PR-Agent-like tools for prompt and permission risk. |
| GitHub Agentic Workflows | A platform direction for running repository automation with AI agents in GitHub Actions. | This is the ecosystem we protect. | We will not implement an agent workflow runtime. | We provide a safety gate for maintainers adopting AI workflow automation. |
| Aikido PromptPwnd write-up | Demonstrates prompt injection risks in AI-integrated GitHub Actions and GitLab workflows. | Directly motivates prompt-to-agent checks. | We will not reproduce real-world exploit payloads. | We turn the risk pattern into deterministic local checks with safe synthetic fixtures. |
| Agentic Workflow Injection / TAINTAWI research | Defines and studies Prompt-to-Agent and Prompt-to-Script vulnerability patterns in real workflows. | Direct conceptual overlap. | We will not claim full academic taint-analysis precision in v0.1.0. | We implement a practical CLI/GitHub Action with SARIF output for maintainers. |

## Conclusion

`agentic-workflow-guard` is not a general GitHub Actions scanner. It is a specialized tool for AI agent workflow boundaries:

- Which steps are AI agents or AI inference actions?
- Does untrusted GitHub event context reach prompt-like inputs?
- Does the AI job have write permissions or secrets?
- Does agent-derived output flow into scripts or privileged CLIs?
- Does a privileged workflow check out contributor-controlled PR head code?

That narrow scope is the project advantage.
