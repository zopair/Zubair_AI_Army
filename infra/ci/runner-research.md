# Runner alternatives — GitHub repository research

The required capability is not necessarily named `runner`. We need a local/self-hosted execution worker that can receive CI jobs, execute them in an isolated environment, and report results.

## Candidates discovered

### 1. gitea-actions-runner — ChristopherHX/gitea-actions-runner
Repository: https://github.com/ChristopherHX/gitea-actions-runner
Role: Gitea Actions-compatible execution runner. Useful when the control plane is Gitea/Forgejo-compatible.

### 2. docker-gitea-actions-runner — actions-oss/docker-gitea-actions-runner
Repository: https://github.com/actions-oss/docker-gitea-actions-runner
Role: containerized Gitea Actions runner. Attractive for disposable/container-first execution.

### 3. garm — cloudbase/garm
Repository: https://github.com/cloudbase/garm
Role: GitHub Actions Runner Manager. This is an orchestration/control-plane option for provisioning and managing GitHub runners rather than merely executing one job.

### 4. act_runner — droplet-js/act_runner
Repository: https://github.com/droplet-js/act_runner
Role: an alternative implementation named as an Actions runner; candidate for experiments where GitHub Actions-compatible semantics are desired.

### 5. nixos-fireactions — thpham/nixos-fireactions
Repository: https://github.com/thpham/nixos-fireactions
Role: Firecracker/Nix-oriented execution approach; candidate when stronger workload isolation is more important than simple Docker execution.

## Selection rule

Do not select by repository name alone. Before adoption, verify maintenance activity, license, architecture, protocol compatibility, secrets handling, container isolation, and whether it can run the exact ZOPAIR workload.

## Current recommendation

Primary path: Forgejo Actions + official act_runner when a Forgejo control plane is available.

Secondary path: docker-gitea-actions-runner for containerized execution.

GitHub-native management option: garm if GitHub-hosted control remains necessary but execution must move to managed self-hosted workers.

Experimental isolation path: Firecracker-based approaches such as nixos-fireactions.

Local developer fallback remains `act` for GitHub Actions workflow emulation; it is not treated as a production scheduler.
