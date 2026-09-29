---
last-reviewed: 2026-09-29
---

# First review

[中文](quickstart.zh-CN.md) · [Design](design.md) · [Testing](testing.md)

This guide describes the intended user journey for team **0.1.37**. It is not a record that every step has passed acceptance. Read the outstanding implementation conflicts in [Design](design.md).

## Install and prepare

1. Open the DesireCore marketplace and locate **合同审查团队 / contract-review-team**. Check its publisher and source against this repository before installing.
2. Check the installed team version and six identities against [team.json](../team.json) and [members.lock.json](../members.lock.json): lead, intake, extractor, scanner, auditor and reporter. The supervisor counts as one of the six.
3. Select an available model from `desirecore-cloud`. Record the provider and model used for the review; model availability may vary. Do not edit published member files merely to select your local model.
4. Choose tool approvals according to your preference. The historical unattended test used the user's explicit “allow all” setting. Tool approval does not decide contractual terms.
5. Prepare the complete source, available attachments and earlier versions. State which party you represent, the intended jurisdiction, your goals and any unresolved facts. The team's declared legal service scope is mainland China; other jurisdictions receive scope disclosure and referral, while generic document checks continue.

UI labels vary by DesireCore version. These instructions do not assume a particular button layout or undocumented API.

## Submit a contract

Upload or select the source files in your instance and send the lead a request such as:

> Review the attached procurement agreement from the buyer's perspective. Our priorities are payment tied to acceptance, usable remedies and a clear liability allocation. The intended governing law is mainland China. Attachment 2 is not available yet. Preserve the source, identify evidence for each finding, distinguish unknowns from confirmed facts, and deliver a report plus a Word document with tracked proposed revisions where export is available. List decisions that still need our confirmation. Do not invent missing facts.

Use your actual party, jurisdiction and priorities. An unknown party or jurisdiction is useful information; do not guess merely to start a review.

## Read and retrieve the result

- Ask for accessible report and DOCX links or paths in the final reply. Open the files from your instance; a filename in a message alone is not proof of delivery.
- Check the reviewed source/version, scope, evidence, risk priorities, proposed actions, uncovered items and pending decisions. The contract score measures the contract under the stated rubric, not the team's test quality.
- A blocked intake should explain the missing or invalid input and how to resubmit. A conditional input should preserve its limitations throughout subsequent work.
- Pending payment, dispute, liability or effectiveness decisions should appear in a **pending-confirmation report**. That deliverable does not authorize signature or acceptance of the proposed terms. This is an acceptance target; current end-to-end completion remains unproven.
- Open the DOCX in Word or a compatible editor with revisions displayed. Verify that insertions/deletions are real tracked changes, not merely colored text. See [DOCX acceptance](testing.md#docx-acceptance).

## Supplement or compare

For a missing attachment: “Here is Attachment 2 for the same contract. Create a new review attempt, retain the old outputs, recheck affected findings and explain what changed.”

For negotiation versions: “Compare the attached v1 and v2, including all attachments. Report changed obligations, risk direction and actions. If any component is unavailable, state the comparison limit rather than declaring the versions identical.”

Explicitly name the versions and files. Do not overwrite prior evidence when resubmitting.

## When something fails

Record the app/team/member versions, model, run identifier, time, source digest, exact error and last completed step. Retain logs and artifacts, removing credentials before sharing. Installation, delegation or export failures belong in a platform investigation; unsupported findings or missing business coverage belong in member/rule evaluation. Do not label a manually repaired output as an autonomous success.
