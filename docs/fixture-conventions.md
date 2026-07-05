# Fixture Conventions

Fixtures are small GitHub Actions workflows used to explain and test scanner
behavior. They should be easy for new contributors to read without knowing the
whole codebase.

## Folder Layout

| Folder | Purpose |
| --- | --- |
| `tests/fixtures/vulnerable` | Compact workflows that should produce one or more risky findings |
| `tests/fixtures/safe` | Workflows that should avoid high and critical findings |
| `tests/fixtures/dataflow` | Focused AI-output data-flow examples |
| `tests/fixtures/config` | Configuration, suppression, and exclude-path behavior |
| `tests/fixtures/baseline` | Baseline file behavior |
| `tests/fixtures/contributor-friendly` | Beginner examples that pair readable workflows with targeted tests |

## Naming

- Use lowercase kebab-case file or folder names.
- Prefer names that describe the risk path, such as
  `untrusted-issue-prompt.yml` or `agent-output-to-script.yml`.
- Keep each fixture focused on one teaching goal.
- Use `workflow.yml` inside nested folders when the folder name carries the
  scenario name.

## Synthetic Data

Do not include:

- real secrets or realistic secret values
- real vulnerable third-party repositories
- copied exploit payloads from public projects
- real usernames, organization names, customer data, or private issue text

Use obvious placeholders such as `example`, `demo`, `fake`, and `synthetic`.

## Beginner Fixtures

The `contributor-friendly` folder contains first-stop examples:

- `read-only-ai-summary.yml` shows a low-risk advisory AI step.
- `untrusted-issue-prompt.yml` shows untrusted issue text crossing into a prompt.
- `agent-output-to-script.yml` shows AI output reaching dynamic shell execution
  and a sensitive sink.

When adding a beginner fixture, add a short assertion to `tests/scanner.test.ts`
so contributors can see exactly which rule the fixture is meant to teach.
