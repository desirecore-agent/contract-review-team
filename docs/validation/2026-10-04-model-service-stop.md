# Model service stop regression - 2026-10-04

Tested shared rules from commit `c358287` (the complete commit and SHA-256 are recorded in the adjacent JSON), through the production DesireCore compatibility proxy from source commit `b6085374ec473a751bcf04bdf0b55a117b0c903e`, using an isolated runtime root and its configured live chat model. All input materials and prerequisite declarations were synthetic. Credentials and private configuration are excluded from this repository.

| Scenario | Independent requests | Observed result |
| --- | --- | --- |
| Affected review service unavailable | 3 | blocked, null handoff, no business tool intent, no score or business artifact |
| Model route cannot be confirmed | 3 | Same stop result |
| Separate-cost authorization absent | 3 | Same stop result |

All nine responses identify exactly the matching failed prerequisite field through structured `failedPrerequisites`, not a keyword match. Operational status and source-scope observations are carried in the capability-debt/explanation fields; the findings array is empty in every run. The unavailable-service fixture was established by a real failed loopback health connection performed by the harness, not by the agent. Both native tool calls and textual XML tool intents are inspected. This configured transport emitted XML intents for the local status observer; none requested Delegate, ToolAPI or Write. The observer is not a production business tool and does not dispatch work.

This is live model-turn evidence for the new rules. It is not a full Agent Service/installed-team run, marketplace installation test, outage of the inference transport, real-contract acceptance, or DOCX appearance test. The framework approval/injection and downstream runtime remain separate integration coverage. Earlier collector trials exposed JSON/text-format assumptions; the final reproducible collector uses a structured status observer and recognizes both tool-call encodings. Route stimulus was also clarified to isolate health-probe evidence from the route scenario; those three requests were rerun independently. The collector was hardened to inspect native and XML intents independently and validate the complete observer receipt; a malformed capability-debt response was rejected and its affected request was rerun. The six decoder regression tests pass. After limiting the universal stop signal to null handoff while preserving member-specific status vocabularies, all nine accepted requests were collected against the committed source with the strict collector and exact failed-prerequisite codes. HTTP 502 and malformed artifact-status entries were rejected; remaining requests were repeated, rather than counting those trials as passes. The runner captures the DesireCore checkout commit automatically.

## Reproduce

Use a DesireCore source checkout with its dependencies available, and an isolated runtime root seeded privately with the intended compute configuration. From this team repository:

```sh
DESIRECORE_CHECKOUT=<desirecore-source-checkout> \
DESIRECORE_HOME=<isolated-runtime-root> \
DESIRECORE_TEST_REAL_LLM=1 \
<desirecore-source-checkout>/node_modules/.bin/tsx \
  --tsconfig <desirecore-source-checkout>/tsconfig.json \
  shared/resources/check-model-service-stop.live.ts
```

The runner uses the configured chat model through the production proxy and consumes API quota. Without the explicit live flag it skips. It records diagnostics in a private temporary directory; publish only reviewed, sanitized results. Never put credentials or private runtime data into this repository. See [captured responses](2026-10-04-model-service-stop.json).
