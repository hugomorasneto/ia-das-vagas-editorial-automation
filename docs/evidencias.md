# Evidências da automação editorial

## Execuções registradas no ambiente do projeto

| Cenário | Como foi conferido | Resultado registrado |
| --- | --- | --- |
| Ciclo agendado | Comparação do estado da fila com a releitura do post, da imagem destacada e dos metadados de SEO no WordPress | Uma pauta selecionada, uma imagem e um rascunho privado com SEO conferido |
| Recuperação por etapa | Comparação dos checkpoints por hash e conferência dos artefatos persistidos após a retomada | Briefing, artigo, revisão e imagem reaproveitados. A retomada criou somente a mídia e o rascunho que faltavam |

Esses registros descrevem duas validações históricas do projeto. Os arquivos abaixo permitem ao leitor conferir regras específicas em um ambiente local, com dados fictícios.

## Demonstração local

Com Node.js 20 ou superior, execute na raiz do repositório.

```sh
node --test demo/workflows.test.mjs
```

O teste confere a estrutura dos três JSONs e executa trechos do código dos nós com entradas fictícias. Os cenários verificam o bloqueio de uma decisão de pauta ausente, a validação estrutural de fontes e a preparação de um rascunho válido. Também verificam o bloqueio quando o pedido tenta publicar ou quando os metadados da mídia divergem.

Na revisão técnica, abra os nós **Seleção — Validar política e candidata**, **Validação — Factual estrutural** e **WordPress — Preparar criação do rascunho** para ler as regras testadas. Para acompanhar a implementação no editor do n8n, importe os JSONs de [workflows](../workflows/).
