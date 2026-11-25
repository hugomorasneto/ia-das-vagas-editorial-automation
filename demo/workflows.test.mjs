import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const names = ['topic-radar', 'topic-selection', 'content-factory'];
const workflows = Object.fromEntries(names.map(name => [
  name, JSON.parse(readFileSync(new URL(`../workflows/${name}.json`, import.meta.url), 'utf8')),
]));
const externalTypes = new Set([
  'n8n-nodes-base.httpRequest',
  'n8n-nodes-base.executeWorkflow',
  '@n8n/n8n-nodes-langchain.openAi',
]);
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

async function runNode(workflow, name, input, upstream = {}) {
  const node = workflows[workflow].nodes.find(candidate => candidate.name === name);
  assert.ok(node?.parameters.jsCode, `Nó de código indisponível: ${name}`);
  const run = new AsyncFunction('$input', '$', node.parameters.jsCode);
  const [result] = await run({ first: () => ({ json: input }) }, requested => {
    assert.ok(Object.hasOwn(upstream, requested), `Nó anterior indisponível: ${requested}`);
    return { first: () => ({ json: upstream[requested] }) };
  });
  return result.json;
}

for (const [name, workflow] of Object.entries(workflows)) {
  test(`${name}: estrutura e isolamento das integrações`, () => {
    assert.equal(workflow.active, false);
    assert.deepEqual(Object.keys(workflow).sort(), ['active', 'connections', 'name', 'nodes', 'settings']);
    const nodes = new Set(workflow.nodes.map(node => node.name));
    assert.equal(nodes.size, workflow.nodes.length);
    assert.equal(new Set(workflow.nodes.map(node => node.id)).size, nodes.size);

    for (const [source, outputs] of Object.entries(workflow.connections)) {
      assert.ok(nodes.has(source), `Origem ausente: ${source}`);
      for (const connection of Object.values(outputs).flat(2).filter(Boolean)) {
        assert.ok(nodes.has(connection.node), `Destino ausente: ${connection.node}`);
      }
    }

    for (const node of workflow.nodes) {
      assert.equal(node.credentials, undefined);
      assert.equal(node.webhookId, undefined);
      if (externalTypes.has(node.type)) assert.equal(node.disabled, true, node.name);
      if (node.type === 'n8n-nodes-base.httpRequest') {
        assert.equal(new URL(node.parameters.url).hostname, 'integration.example.invalid');
      }
      if (node.type === 'n8n-nodes-base.executeWorkflow') {
        assert.equal(node.parameters.workflowId.value, 'demo-checkpoint-store');
      }
      if (node.parameters.jsCode) {
        assert.doesNotThrow(() => new AsyncFunction(node.parameters.jsCode), node.name);
      }
    }
  });
}

test('Topic Selection bloqueia uma decisão ausente', async () => {
  const input = await runNode('topic-selection', 'Seleção — Receber decisão automática', {});
  const evaluated = await runNode('topic-selection', 'Seleção — Validar política e candidata', input);
  const result = await runNode('topic-selection', 'Saída — Seleção bloqueada', evaluated);
  assert.equal(evaluated.selection.passed, false);
  assert.equal(result.status, 'TIERED_SELECTION_BLOCKED');
  assert.equal(result.content_factory_input, null);
});

function articleInput() {
  return {
    input_origin: 'AUTOMATIC_TOPIC_SELECTION_SUBWORKFLOW',
    configuration: { minimum_current_evidence_sources: 1, minimum_approved_external_sources: 2 },
    article: {
      markdown_content: 'Exemplo de preparação para entrevistas.',
      external_sources: [
        {
          url: 'https://a.example.invalid/carreira', audited: true,
          source_authority_id: 'fontes-a', role: 'CURRENT_EVIDENCE',
        },
        {
          url: 'https://b.example.invalid/entrevistas', audited: true,
          source_authority_id: 'fontes-b', role: 'HISTORICAL_CONTEXT',
        },
      ],
    },
    editorial_validation: { validation_status: 'PASS' },
    warnings: [],
    checkpoints: [],
  };
}

test('Content Factory aceita a cobertura estrutural de duas fontes independentes', async () => {
  const result = await runNode('content-factory', 'Validação — Factual estrutural', articleInput());
  assert.equal(result.factual_validation.validation_status, 'PASS');
  assert.equal(result.factual_validation.source_authority_count, 2);
  assert.equal(result.factual_validation.current_evidence_source_count, 1);
});

test('Content Factory bloqueia fonte insuficiente para uma estatística', async () => {
  const input = articleInput();
  input.article.markdown_content = 'Exemplo fictício de uma afirmação de 90%.';
  input.article.external_sources = [];
  const result = await runNode('content-factory', 'Validação — Factual estrutural', input);
  assert.equal(result.factual_validation.validation_status, 'FAIL');
  assert.ok(result.factual_validation.blockers.includes('APPROVED_EXTERNAL_SOURCE_COVERAGE_INVALID'));
  assert.ok(result.factual_validation.blockers.includes('UNSUPPORTED_STATISTIC'));
});

function draftInput() {
  return {
    configuration: {
      wordpress_publish_enabled: false,
      real_publish_enabled: false,
      wordpress_update_existing_posts_enabled: false,
      max_wordpress_drafts_per_execution: 1,
    },
    wordpress_draft_request: {
      title: 'Preparação para entrevistas', slug: 'preparacao-para-entrevistas',
      status: 'draft', content_html: '<p>Exemplo de artigo.</p>', excerpt: 'Exemplo.',
      category_id: 7, tag_ids: [12],
    },
    wordpress_media_upload: { media_id: 42 },
    wordpress_media_metadata_payload: {
      alt_text: 'Ilustração fictícia de entrevista', title: 'Entrevista',
      caption: 'Exemplo de legenda', description: 'Imagem de demonstração',
    },
    warnings: [],
    checkpoints: [],
  };
}

async function prepareDraft(data, responseBody = { id: 42, ...data.wordpress_media_metadata_payload }) {
  return runNode(
    'content-factory', 'WordPress — Preparar criação do rascunho',
    { statusCode: 200, body: responseBody },
    { 'WordPress — Preparar metadados da imagem': data },
  );
}

test('Content Factory prepara um rascunho com a imagem conferida', async () => {
  const result = await prepareDraft(draftInput());
  assert.equal(result.wordpress_post_create_allowed, true);
  assert.equal(result.wordpress_post_payload.status, 'draft');
  assert.equal(result.wordpress_post_payload.featured_media, 42);
});

test('Content Factory bloqueia um pedido de publicação', async () => {
  const input = draftInput();
  input.wordpress_draft_request.status = 'publish';
  const result = await prepareDraft(input);
  assert.equal(result.wordpress_post_create_allowed, false);
  assert.equal(result.wordpress_post_payload, null);
});

test('Content Factory bloqueia escrita com metadados divergentes', async () => {
  const input = draftInput();
  const result = await prepareDraft(input, {
    id: 42, ...input.wordpress_media_metadata_payload, alt_text: 'Texto divergente',
  });
  assert.equal(result.wordpress_post_create_allowed, false);
  assert.equal(result.wordpress_post_payload, null);
  assert.ok(result.warnings.some(warning => warning.code === 'WORDPRESS_MEDIA_METADATA_FAILED'));
});
