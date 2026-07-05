# Data Flow Model

`agentic-workflow-guard` uses deterministic static analysis. It does not execute workflows and does not send workflow contents to a model.

## Tracked Sources

- AI action step outputs referenced as `${{ steps.<id>.outputs.<name> }}`
- Common GitHub expression wrappers around step outputs, such as `format(...)`, `join(...)`, and `toJson(...)`
- One-step `env` indirection from an AI step output into the same `run:` step

## Tracked Sinks

- Later `run:` steps in the same job
- Dynamic shell execution such as `bash -c`, `sh -c`, `eval`, `node -e`, `python -c`, `ruby -e`, or `perl -e`
- Sensitive write or deploy commands such as `gh pr merge`, `git push`, `npm publish`, `docker push`, `kubectl apply`, and cloud CLIs

## Severity Model

- Recognized data-only output, such as simple `echo` or `printf` usage, is lower risk.
- Dynamic execution of AI-derived data is critical.
- AI-derived data passed to privileged write, publish, merge, or deploy commands is high or critical depending on the sink.
- Ambiguous script usage remains high until the workflow can be reviewed or narrowed.

## Known Limitations

- Complete GitHub expression AST parsing is not implemented.
- Cross-job outputs are not tracked.
- Artifact, cache, and workspace-file data flow are not fully tracked.
- Composite actions and reusable workflows are not analyzed yet.
- Shell parsing is conservative and intentionally favors clear evidence over exhaustive interpretation.
