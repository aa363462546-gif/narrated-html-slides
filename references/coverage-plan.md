# Source Coverage Contract

`coverage-plan.json` is produced before slide content. Deterministic extraction identifies Latin-name candidates, quoted names, numbers with units, enumerated steps, list items, comparisons, and explicit conclusions. SRT is parsed first and each cue is extracted independently. Names never cross cue boundaries or blank lines; adjacent acronym tokens such as `PS  PR` remain independent candidates.

Extraction candidates are not automatically mandatory display items. Classify genuine software, project, person, platform, step, metric, comparison, conclusion, or explicit parallel item as `named_entity`. A Latin token that is only ordinary speech may use `classification: ordinary_spoken_term`, `status: not_required`, and a specific `classification_reason`. This classification is not an omission and cannot be used to hide an extraction error.

For `approval_sample`, extraction and validation use only the three selected cue ranges. For `complete`, they use the full source.

Every item must be either:

```json
{"id":"coverage-001","source_text":"Excel","type":"software","status":"visible","scene_id":"scene-03","slot":"title-01"}
```

or:

```json
{"id":"coverage-002","source_text":"2023","type":"number","status":"omitted","omit_reason_code":"nonessential-background-time","omit_reason":"Only background time; it does not change the claim."}
```

Approved omission codes are narrow and require a specific explanation. Generic reasons such as “not important” fail. All parts of an explicit parallel group, sequence, or comparison must be mapped together. A visible mapping passes only when the text is actually rendered in the declared scene body.
