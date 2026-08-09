# act fallback

`act` is the local GitHub Actions-compatible execution fallback.

Use it when GitHub-hosted Actions is unavailable or unsuitable. The fallback runs the same workflow definitions locally through a container runtime and must produce the same contract-level smoke results.

Required benchmark dimensions:
- correctness
- elapsed time
- image/cache warmup
- resource use
- reproducibility

The fallback is intentionally documented separately from the agent contract so agents never need to know which CI backend is active.
