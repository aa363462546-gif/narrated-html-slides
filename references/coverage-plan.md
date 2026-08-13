# Source Coverage Contract

`coverage-plan.json` is produced before slide content. Deterministic extraction identifies Latin product names, quoted names, numbers with units, enumerated steps, list items, comparisons, and explicit conclusions. The Agent may add missed Chinese names or implicit semantic items, but may not remove extracted items.

Every item must be either:

```json
{"id":"coverage-001","source_text":"Excel","type":"software","status":"visible","scene_id":"scene-03","slot":"title-01"}
```

or:

```json
{"id":"coverage-002","source_text":"2023","type":"number","status":"omitted","omit_reason_code":"nonessential-background-time","omit_reason":"Only background time; it does not change the claim."}
```

Approved omission codes are narrow and require a specific explanation. Generic reasons such as “not important” fail. All parts of an explicit parallel group, sequence, or comparison must be mapped together. A visible mapping passes only when the text is actually rendered in the declared scene body.
