# Agent Interface

The Infrastructure Fabric is designed for agents, not infrastructure experts.

## One contract

Agents submit a task with only:

```yaml
id: normalize-json
command: node
args: [scripts/normalize.mjs, input.json]
```

The fabric returns:

```json
{
  "id": "normalize-json",
  "status": "succeeded",
  "exitCode": 0,
  "stdout": "...",
  "stderr": "..."
}
```

## Agent-facing rules

1. Agents should request outcomes, not manipulate providers directly.
2. Provider selection is an infrastructure concern.
3. Secrets are referenced by name, never supplied inline.
4. Tasks must be deterministic and auditable where possible.
5. Failure responses must be machine-readable.
6. A retry policy belongs to the fabric, not every agent.
7. Agents must not need to know whether execution uses local, Dagger, `act`, or another backend.

## Design goal

A new agent should be able to become productive after learning one small task schema. Infrastructure complexity stays behind the Fabric API.
