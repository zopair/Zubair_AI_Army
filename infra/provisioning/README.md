# Infrastructure Provisioning Agent

This component defines an authorized infrastructure operator for ZOPAIR.

## Responsibilities
- Provision approved development infrastructure through browser/API automation.
- Configure GitHub repositories, CI, secrets references, and runner labels after explicit authorization.
- Use an approved mailbox for transactional verification messages.
- Perform post-provisioning security checks and emit an audit report.
- Never store passwords, recovery codes, API secrets, session cookies, or private keys in the repository.

## Human checkpoints
The operator must pause for actions that require proof of human presence, legal acceptance, payment authorization, CAPTCHA, or other provider-controlled verification.

## Design principle
Automation performs repeatable configuration; provider security controls remain authoritative.
