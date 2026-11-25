# From topic discovery to a WordPress draft

**IA das Vagas · Editorial workflow automation**

Hugo Moraes Neto, Founder & Product Lead

## The problem

An editorial workflow has to do more than generate text. It has to choose a topic worth covering, check its sources, prevent repeat coverage and hand over a draft an editor can review.

## The work

The workflow uses n8n to connect topic research, source checks, AI-assisted writing, editorial validation and WordPress. It checks the proposed topic against the existing catalog, applies rules for source coverage and eligible topics, then prepares a private draft with its featured image and SEO metadata.

The editorial decision was to keep the review at the point where the editor can see the full draft. For recovery, the system records completed stages and checks the existing WordPress state before repeating a write.

## What was verified

- **Scheduled run.** The execution selected one topic and produced one private WordPress draft. A readback confirmed the featured image and SEO metadata.
- **Controlled recovery.** The rerun reused the saved brief, article, editorial review and generated image. It created only the missing media upload and draft.

These outcomes describe the recorded scenarios. The public package includes reference workflows and an offline test that exercises the topic-selection, source-validation and draft-creation safeguards with synthetic inputs. [Evidence and local test instructions](evidencias.md)

## Review the implementation

- [Topic discovery workflow](../workflows/topic-radar.json)
- [Topic selection workflow](../workflows/topic-selection.json)
- [Article and draft workflow](../workflows/content-factory.json)
