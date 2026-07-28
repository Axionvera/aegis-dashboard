# Compliance Reviewer Workflow

> **IMPORTANT DISCLAIMER**: This document describes the operational workflow for using the Aegis Dashboard's compliance review interface. It is **not legal, regulatory, or financial advice**. The smart contracts and dashboard implement protocol-level compliance mechanics only. They do not determine whether any specific investor is permitted to hold an RWA token under applicable law. All compliance decisions must be made by qualified personnel in accordance with applicable laws and regulations.

## Overview

The Aegis Dashboard provides a bulk compliance review interface that allows authorized compliance operators to review investor eligibility, check external KYC evidence, and update protocol whitelist states. This workflow document explains the end-to-end process for compliance reviewers.

## Role Assumptions

### Compliance Operator
- Has admin/compliance authority in the Aegis system
- Is trained in KYC/AML procedures relevant to their jurisdiction
- Has access to external KYC provider systems
- Understands the legal and regulatory requirements for RWA token issuance
- Has been granted the necessary wallet permissions to execute compliance actions

### System Responsibilities
- The dashboard provides a UI for viewing compliance status and executing protocol actions
- The smart contracts enforce on-chain authorization and state changes
- The system does not perform real-world KYC verification itself
- External identity providers handle actual KYC document collection and verification

## Workflow Steps

### 1. Access the Compliance Review Interface

**Prerequisites:**
- Connected wallet with admin/compliance role
- Valid session with the Aegis Dashboard

**UI Steps:**
1. Navigate to the compliance review page (typically `/compliance` or admin section)
2. Connect your wallet if not already connected
3. Verify your role is recognized (admin/compliance authority required)

### 2. Review the Compliance Queue

The compliance review table displays all subjects awaiting review, sorted by severity:

**Status Indicators:**
- **Pending** (amber): Awaiting data or initial review
- **Review** (sky): Requires manual review due to warnings
- **Approved** (emerald): All checks passed, whitelisted
- **Rejected** (rose): Checks failed, not whitelisted

**Check Results:**
- **Pass** (green dot): Check completed successfully
- **Fail** (red dot): Check failed
- **Warn** (yellow dot): Check passed with warnings
- **Unknown** (gray dot): Check data not available

**Severity Sorting:**
- Critical subjects appear first
- High severity subjects appear next
- Medium and low severity subjects follow

### 3. Filter and Prioritize

**Filtering Options:**
- Filter by subject address (Stellar public key)
- Filter by jurisdiction code
- Filter by status (pending, review, approved, rejected)

**Prioritization Guidelines:**
1. Review **critical** and **high** severity subjects first
2. Address **pending** subjects that have been waiting longest
3. Review **review** status subjects with warnings
4. Periodically audit **approved** subjects for ongoing compliance

### 4. Perform External KYC Verification

**Critical Step**: The dashboard shows compliance check results, but actual KYC verification happens externally.

**External KYC Process:**
1. Note the subject's identifier (address or reference ID)
2. Access your external KYC provider system (e.g., identity verification service)
3. Retrieve the subject's KYC documents and verification status
4. Verify that:
   - Identity documents are valid and not expired
   - Source of funds documentation is complete
   - Risk assessment meets your organization's standards
   - Sanctions screening results are acceptable
   - Jurisdictional requirements are met

**KYC Evidence Requirements:**
- Government-issued ID (passport, driver's license, national ID)
- Proof of address (utility bill, bank statement)
- Source of funds documentation
- Risk assessment questionnaire responses
- Any jurisdiction-specific requirements

### 5. Compare Dashboard Status with External KYC

**Reconciliation Process:**
1. Review the compliance checks shown in the dashboard
2. Compare each check result with your external KYC findings
3. Identify discrepancies between protocol status and external verification

**Common Discrepancies:**
- Dashboard shows `unknown` but external KYC is complete → Update external data source
- Dashboard shows `pass` but external KYC has concerns → Flag for review
- Dashboard shows `fail` but external KYC is clean → Investigate data source error

### 6. Make Compliance Decision

Based on your external KYC verification and dashboard check results, determine the appropriate action:

**Approve** when:
- All external KYC checks pass
- All dashboard checks show `pass`
- Subject meets all jurisdictional requirements
- Risk assessment is acceptable

**Reject** when:
- External KYC verification fails
- Dashboard checks show `fail`
- Subject is on sanctions lists
- Jurisdictional requirements are not met
- Risk assessment is unacceptable

**Flag for Review** when:
- Dashboard checks show `warn`
- External KYC has minor discrepancies
- Additional documentation is needed
- Risk assessment requires senior review

### 7. Execute Protocol Action

**UI Steps:**
1. Select the subject(s) you want to act on using checkboxes
2. Choose the appropriate bulk action:
   - **Approve selected**: Updates protocol state to whitelisted
   - **Reject selected**: Updates protocol state to rejected
   - **Flag for review**: Marks subjects for manual review
   - **Clear selection**: Deselects all subjects
3. Confirm the action when prompted
4. Wait for on-chain transaction confirmation

**Safety Features:**
- Bulk actions are disabled unless rows are selected
- Actions require wallet confirmation
- On-chain enforcement provides final authorization
- Audit trail is maintained on-chain

### 8. Document Your Decision

**Record Keeping:**
- Note the reason for approval/rejection in your internal systems
- Reference the transaction hash for protocol state changes
- Maintain external KYC evidence according to regulatory requirements
- Document any discrepancies or exceptional circumstances

**Audit Trail:**
- Dashboard actions are recorded on-chain
- External KYC records should be maintained per your organization's retention policy
- Cross-reference protocol transactions with internal compliance records

### 9. Monitor and Re-review

**Ongoing Monitoring:**
- Periodically review approved subjects for ongoing compliance
- Monitor for changes in sanctions status
- Re-verify high-risk subjects on a scheduled basis
- Update protocol state if compliance status changes

**Re-review Triggers:**
- Sanctions list updates
- Jurisdictional regulatory changes
- Subject risk profile changes
- Time-based re-verification schedules
- Internal audit findings

## Compliance Operator Responsibilities

### Primary Responsibilities
1. **Verify KYC Evidence**: Thoroughly review external KYC documentation before making protocol decisions
2. **Follow Regulatory Requirements**: Ensure all actions comply with applicable laws and regulations
3. **Maintain Records**: Keep accurate records of compliance decisions and rationale
4. **Report Issues**: Escalate suspicious activity or compliance concerns to appropriate channels
5. **Stay Informed**: Keep up-to-date with regulatory changes and best practices

### Decision-Making Authority
- Compliance operators have authority to approve/reject subjects based on their verification
- Final authority may require escalation depending on your organization's governance structure
- Protocol actions are irreversible once confirmed on-chain

### Accountability
- All compliance decisions are attributable to the operator who executed them
- On-chain transactions provide an immutable audit trail
- External KYC records must be maintained for regulatory compliance

## External KYC Assumptions

### KYC Provider Integration
- The dashboard references external KYC data but does not store sensitive documents
- KYC providers handle document collection, verification, and storage
- Compliance operators must have access to external KYC systems
- Data synchronization between external providers and the dashboard may have delays

### Data Privacy
- Personally Identifiable Information (PII) is not stored in the dashboard or on-chain
- Only identifiers and reference codes are stored in the protocol
- Sensitive KYC documents reside in secure external systems
- Compliance operators must follow data privacy regulations when accessing external KYC data

### Verification Standards
- KYC verification standards vary by jurisdiction
- Operators must understand requirements for each jurisdiction they serve
- Risk assessment methodologies should align with industry best practices
- Source of funds verification is required for most RWA token investments

### Third-Party Dependencies
- The dashboard depends on external KYC providers for verification data
- Providers may have different verification standards and timelines
- Operators should verify provider reliability and accreditation
- Backup procedures should exist for provider outages

## UI Reference

### Bulk Compliance Review Table

**Location**: `/compliance` or admin section

**Key Elements:**
- **Filter input**: Search by address or jurisdiction
- **Status chips**: Show count of each status type
- **Bulk action buttons**: Approve, Reject, Flag for Review, Clear selection
- **Table columns**: Subject ID, Severity, Status, Checks
- **Check indicators**: Color-coded dots for each check result

**Status Badge Colors:**
- Pending: Amber background, amber text
- Approved: Emerald background, emerald text
- Rejected: Rose background, rose text
- Review: Sky background, sky text

**Check Result Colors:**
- Pass: Green dot
- Fail: Red dot
- Warn: Yellow dot
- Unknown: Gray dot

### Action Buttons

**Approve selected** (green):
- Updates protocol state to whitelisted
- Enables token transfers for approved subjects
- Requires wallet confirmation

**Reject selected** (red):
- Updates protocol state to rejected
- Disables token transfers for rejected subjects
- Requires wallet confirmation

**Flag for review** (blue):
- Marks subjects for manual review
- Does not change protocol state
- Used for subjects needing additional attention

**Clear selection** (gray):
- Deselects all selected rows
- Does not change protocol state
- Used to reset selection

## Review Checklist

Before approving a subject, verify:

- [ ] External KYC documentation is complete and valid
- [ ] Identity documents are not expired
- [ ] Source of funds is documented and acceptable
- [ ] Sanctions screening results are clean
- [ ] Jurisdictional requirements are met
- [ ] Risk assessment is within acceptable parameters
- [ ] Dashboard checks align with external KYC findings
- [ ] No discrepancies between protocol status and external verification
- [ ] Decision is documented in internal systems
- [ ] Transaction hash is recorded for audit trail

Before rejecting a subject, verify:

- [ ] Specific reason for rejection is identified
- [ ] Rejection is justified by KYC findings
- [ ] Dashboard checks support the rejection decision
- [ ] Rejection reason is documented
- [ ] Subject is notified according to your procedures
- [ ] Transaction hash is recorded for audit trail

## Legal Disclaimers

### Protocol-Level Compliance Only
The Aegis Dashboard and smart contracts implement protocol-level compliance mechanics. They do not:
- Perform real-world KYC verification
- Provide legal or regulatory advice
- Determine permissibility under applicable law
- Replace qualified legal counsel

### Operator Responsibility
Compliance operators are solely responsible for:
- Interpreting applicable laws and regulations
- Making compliance decisions based on their expertise
- Ensuring actions comply with regulatory requirements
- Maintaining proper documentation and records

### No Warranty
The Aegis Protocol is provided without warranty of any kind. Operators should:
- Verify all information independently
- Consult legal counsel as needed
- Ensure compliance with their specific regulatory environment
- Understand the risks associated with RWA token operations

### Jurisdictional Variations
Compliance requirements vary significantly by jurisdiction. Operators must:
- Understand requirements for each jurisdiction they serve
- Adapt workflows to local regulatory requirements
- Seek local legal advice when necessary
- Monitor regulatory changes in relevant jurisdictions

### Smart Contract Limitations
Smart contracts provide on-chain enforcement but cannot:
- Verify real-world identity
- Assess real-world risk
- Interpret complex regulatory requirements
- Replace human judgment in compliance decisions

## Troubleshooting

### Dashboard Shows Unknown Status
**Cause**: External KYC data not synchronized
**Solution**: Check external KYC provider, update data source, or flag for manual review

### Check Results Don't Match External KYC
**Cause**: Data synchronization delay or error
**Solution**: Investigate data source, verify external KYC findings, escalate if needed

### Transaction Failed
**Cause**: Wallet disconnected, insufficient permissions, or network issue
**Solution**: Check wallet connection, verify permissions, retry transaction

### Subject Not Found in Queue
**Cause**: Subject already processed or not in system
**Solution**: Verify subject address, check transaction history, contact support if needed

### Bulk Action Disabled
**Cause**: No subjects selected
**Solution**: Select subjects using checkboxes before clicking bulk action

## Related Documentation

- [Bulk Compliance Review Table](docs/bulk-compliance-review.md) - Technical implementation details
- [KYC Bulk Import Design](docs/kyc-bulk-import-design.md) - Bulk import workflow
- [Route Access](docs/route-access.md) - Role-based access control
- [Architecture Overview](docs/architecture.md) - System architecture
- [Contributing Guide](CONTRIBUTING.md) - Contribution guidelines

## Support and Escalation

For issues or questions related to:
- **Technical problems**: Contact technical support
- **Compliance questions**: Consult legal counsel or compliance officer
- **Protocol bugs**: Report via GitHub issues
- **Security concerns**: Follow security disclosure policy

---

**Document Version**: 1.0  
**Last Updated**: 2026-07-28  
**Issue**: #65
