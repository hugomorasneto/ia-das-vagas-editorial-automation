# IA das Vagas · Automação editorial com n8n

Este projeto automatiza a pesquisa de pautas e a preparação de artigos sobre carreira. O fluxo avalia fontes, evita pautas repetidas e transforma uma candidata elegível em um rascunho no WordPress, com imagem de destaque e metadados de SEO para revisão editorial.

O trabalho foi desenvolvido no IA das Vagas, produto de carreira no qual Hugo Moraes Neto atuou como Founder & Product Lead. O case apresenta as decisões de produto e os controles técnicos que fizeram parte dessa entrega.

## Como funciona

1. **Topic Radar** pesquisa pautas, verifica fontes e compara temas com o catálogo editorial.
2. **Topic Selection** revalida a decisão de seleção por regras de elegibilidade, fontes e vínculo com a execução.
3. **Content Factory** prepara briefing e artigo, revisa o conteúdo e monta o rascunho do WordPress.

Em um ciclo agendado documentado, a automação entregou **um rascunho privado** com imagem e SEO conferidos por releitura do WordPress. Em um teste de recuperação, retomou o processamento usando os artefatos já salvos e criou apenas a mídia e o rascunho que faltavam. [Resultados e método de verificação](docs/evidencias.md)

## Explore o projeto

- [Arquitetura e decisões técnicas](docs/arquitetura.md)
- [Evidências e demonstração local](docs/evidencias.md)
- [English case study for hiring reviewers](docs/case-study-en.md)

| Fluxo de referência | Versão de origem |
| --- | --- |
| [Topic Radar](workflows/topic-radar.json) | `0.4.16` |
| [Topic Selection](workflows/topic-selection.json) | `0.3.8` |
| [Content Factory](workflows/content-factory.json) | `0.8.7` |

Os JSONs preservam os nós, as conexões e as principais regras das versões de origem. Nesta edição, os fluxos estão inativos, as integrações externas estão desabilitadas e os endereços operacionais foram substituídos. Para explorar os fluxos no n8n, importe os JSONs pelo editor. Para executar as verificações locais com dados fictícios, use Node.js 20 ou superior.

```sh
node --test demo/workflows.test.mjs
```
