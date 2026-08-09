# ZOPAIR Operational Research — August 2026

## Objective

Close the gap between a large engineering foundation and a continuously operating, measurable revenue system while minimizing paid infrastructure.

## Findings

### 1. CI / execution

GitHub Actions must not be a single point of execution. The preferred open-source fallback stack is:

1. Dagger for reproducible containerized execution.
2. `act` for local compatibility with GitHub Actions workflows.
3. Woodpecker CI for lightweight self-hosted CI.
4. Forgejo Actions + act_runner as an alternative when a self-hosted Git forge is useful.

Selection rule: use the smallest runtime that can execute the workload; escalate only on failure or resource requirements.

### 2. Agent runtime

Do not replace the existing task contract merely to adopt another agent framework. Keep the ZOPAIR Fabric contract provider-neutral. OpenHands is a useful reference for sandboxed software agents and evaluation; newer research such as Agyn emphasizes stateful execution, on-demand isolation, and least privilege. These ideas should inform the Fabric without creating framework lock-in.

### 3. Automation

Activepieces is a strong candidate for a self-hosted visual automation layer because it is MIT-licensed, extensible in TypeScript, supports AI pieces/agents, human-in-the-loop controls, and network-gapped self-hosting. n8n remains a reference for mature workflow breadth but its current license is fair-code rather than a conventional OSI open-source license. Therefore Activepieces is preferred for the open-source-first objective.

### 4. Product analytics

Self-hosted PostHog is a strong candidate for event-based product analytics, funnels, cohorts, paths, retention and dashboards. It is MIT licensed for self-hosted use, with documented scaling/support tradeoffs. Use it only if the repository's own lightweight event ledger cannot satisfy the first revenue milestone; avoid adding an operationally heavy analytics stack too early.

### 5. Revenue loop

The largest remaining gap is integration, not lack of frameworks. The minimum viable loop is:

market signal -> product selection -> landing page -> useful content -> qualified lead -> authorized outreach -> payment verification -> delivery -> referral -> analytics -> product iteration.

Every stage must emit machine-readable events.

### 6. Market-driven product creation

Introduce a demand scoring pipeline. A product idea is promoted only when it has multiple independent signals such as repeated public problem statements, active repositories/issues, search/discussion evidence, clear buyer intent, and a feasible delivery path. Existing products should be killed or improved based on observed conversion, not vanity metrics.

## Recommended target architecture

```text
                 Market Intelligence
                         |
                 Opportunity Scorer
                         |
                 Portfolio Manager
                         |
             +-----------+-----------+
             |                       |
         Product Agents          Content Agents
             |                       |
             +-----------+-----------+
                         |
                   Revenue Swarm
                  /      |       \
             inbound   outreach   referral
                  \      |       /
                   +-----+------+
                         |
                   Order / Payment
                         |
                    Delivery API
                         |
                    Event Ledger
                         |
                  Revenue Analytics
                         |
                   Feedback Loop
                         |
                 Market Intelligence

Execution layer underneath all agents:
ZOPAIR Fabric -> Dagger -> local -> act -> Woodpecker/Forgejo
```

## Operational blockers to close

- Verify and inventory all claimed products from repository contents; do not rely on a remembered count.
- Give every product a status: working, demo, incomplete, deprecated.
- Add a single machine-readable product registry with price, audience, URL, delivery mode, and owner agent.
- Implement lead/order/event schemas.
- Implement a payment verification boundary without storing payment secrets in code.
- Implement delivery entitlements.
- Implement referral attribution.
- Implement marketing-content generation and approval queues.
- Add rate limits, opt-out handling, deduplication, and audit logs to outreach.
- Add self-hosted CI fallback before any paid CI runner is considered.
- Add health checks and restart/retry policies.
- Add backup/restore procedures before persistent self-hosted state is introduced.

## Definition of Done

The project is not considered operationally complete until one complete end-to-end test passes in a real environment:

1. A public product page is reachable.
2. A real prospect or test buyer can discover the product.
3. A lead/order is recorded.
4. Payment is verified through the configured receiving mechanism.
5. Delivery is triggered automatically.
6. Referral attribution is recorded when applicable.
7. Revenue and cost events are visible in the ledger.
8. The system can recover from a transient execution failure without manual code changes.
9. No paid runtime is required for the baseline workflow.

## Cost-control principle

Open-source/local execution first. Self-hosted second. Free quota third. Paid execution only when a measured bottleneck justifies it. No new paid service should be introduced solely for experimentation.
