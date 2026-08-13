# Narrated HTML Slides

A self-contained Codex Skill for turning complete articles, or matching SRT plus audio inputs, into fixed-stage HTML slides. It ships with two production templates:

- Field Notes A: deep-green botanical editorial style.
- Dark Teal Intelligence: charcoal and teal evidence-led report style.

The core product is `slides.html`; manifests, layout plans, coverage plans, and QA reports are supporting artifacts. SRT is used for cue traceability and semantic pagination. A matching audio path may be recorded as an input reference, but this Skill never opens, processes, generates, mixes, or renders audio or video and never reads another project.

## Install

Clone this repository, then install it as a Codex Skill by copying or linking the repository directory into your Codex Skills directory. Restart Codex after installation.

For HTML QA:

```bash
npm install
node scripts/doctor.mjs
```

Invoke it with `$narrated-html-slides` and provide a complete article or narration script.

## What It Produces

Each job keeps its source and generated `slides.html` together. See `references/job-contract.md`.

## License

Code and documentation are licensed under MIT. Bundled fonts retain their own licenses under `assets/fonts/`.
