# ZOPAIR Open-Source Execution Fabric

ZOPAIR uses open-source execution components only for its core execution plane.

## Approved layers

- GitHub Actions Runner (`actions/runner`) when GitHub is the control plane.
- Forgejo Actions Runner (`act_runner`) when Forgejo is the control plane.
- Docker/Podman for isolated job execution.
- Kubernetes/ARC only when autoscaling becomes necessary.
- Firecracker-compatible isolation only for workloads that require stronger VM boundaries.

## Forbidden for the core execution plane

- Replit-hosted execution.
- Proprietary CI runner services.
- Paid execution services when an evaluated open-source alternative satisfies the requirement.

## Principle

The repository stores configuration and reproducible deployment manifests. The execution host is expected to be an independently controlled machine or VM. A repository cannot manufacture the external compute resource required to run a self-hosted worker.

## First target

Run `actions/runner` on an independently controlled Linux host, register it as an ephemeral runner, execute the ZOPAIR validation workflow, and record the resulting run ID and commit SHA as evidence.
