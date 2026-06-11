# Base de Conhecimento OrçaGuard
## Motor de análise de orçamentos de obras condominiais — SP

> **Uso:** Este arquivo é injetado integralmente no prompt mestre a cada análise.
> Manter atualizado com cada obra real revisada. É o principal ativo competitivo do produto.
> Referência: SINAPI, PINI, TCPO, NR18, NBR 6118, NBR 15575 (norma de desempenho).

---

## 1. FAIXAS DE PREÇO DE REFERÊNCIA — REGIÃO SP (base jun/2026)

> Corrigir anualmente pelo INCC. Valores em R$/unidade indicados.
> Variação de ±20% é aceitável; acima de +40% ou abaixo de -25% → flag obrigatória.

### 1.1 Pintura
| Serviço | Unidade | Faixa aceitável |
|---|---|---|
| Pintura interna c/ tinta PVA (2 demãos) | m² | R$ 18–32 |
| Pintura interna c/ látex acrílico (2 demãos) | m² | R$ 28–48 |
| Pintura externa (fachada) c/ látex acrílico | m² | R$ 35–60 |
| Pintura externa c/ textura acrílica | m² | R$ 55–90 |
| Pintura epóxi piso garagem | m² | R$ 40–75 |
| Limpeza e preparação de fachada (lavagem) | m² | R$ 12–25 |

**Composição mínima esperada — pintura fachada:**
- Lavagem e limpeza, remoção de tinta solta, selador/fundo, 2 demãos de tinta, andaimes, EPI.
- Ausência de andaime em fachada de 3+ pavimentos = red flag grave.
- "Pintura completa" sem especificar número de demãos = ambiguidade proposital — perguntar.

### 1.2 Impermeabilização
| Serviço | Unidade | Faixa aceitável |
|---|---|---|
| Impermeab. laje/cobertura c/ manta asfáltica (3mm) | m² | R$ 120–200 |
| Impermeab. laje/cobertura c/ manta 4mm + proteção | m² | R$ 170–280 |
| Impermeab. box/área molhada c/ argamassa polim. | m² | R$ 90–150 |
| Impermeab. subsolo/reservatório c/ cristalizante | m² | R$ 150–250 |
| Teste de estanqueidade (72h) | vb | R$ 800–2.000 |

**Composição mínima esperada:**
- Regularização de caimento (mínimo 1%), primer, impermeabilizante, proteção mecânica.
- **Ausência de teste de estanqueidade = red flag obrigatória** (como saber se funcionou?).
- Impermeabilização sem regularização de caimento prévia = vai falhar em 2 anos.

### 1.3 Elétrica
| Serviço | Unidade | Faixa aceitável |
|---|---|---|
| Ponto elétrico novo (tomada/interruptor) | ponto | R$ 300–550 |
| Troca de disjuntor QDC | unid | R$ 180–350 |
| Instalação luminária externa (led) | unid | R$ 250–500 |
| Modernização de elevador (elétrica) | vb | depende — exigir memorial |
| Laudo SPDA (para-raios) | vb | R$ 2.000–5.000 |

**Itens obrigatórios em obras elétricas:**
- ART do engenheiro responsável (obrigatória por lei).
- Laudo de medição de resistência de aterramento após obra.
- Memorial descritivo de materiais (marca/bitola dos cabos, modelo de disjuntores).

### 1.4 Estrutura e concreto
| Serviço | Unidade | Faixa aceitável |
|---|---|---|
| Recuperação de estrutura (carbonatação) | m² | R$ 800–1.800 |
| Injeção de fissura (epóxi) | metro linear | R$ 250–600 |
| Tratamento de ferragem exposta | ponto | R$ 180–400 |
| Reparo superficial < 5cm (argamassa estrutural) | m² | R$ 400–900 |

**Composição mínima — recuperação estrutural:**
- Laudo de inspeção prévia com mapeamento de danos.
- Remoção do concreto carbonatado até 2cm além da ferragem.
- Tratamento anticorrosivo da ferragem (fosfato de zinco).
- Recomposição com argamassa estrutural e cura adequada.
- ART do responsável técnico (obrigatória).

### 1.5 Elevadores
| Serviço | Unidade | Faixa aceitável |
|---|---|---|
| Modernização completa (até 6 paradas) | vb | R$ 60.000–140.000 |
| Manutenção preventiva mensal | mês | R$ 800–2.000 |
| Troca de cabos de tração | vb | R$ 8.000–20.000 |

**Atenção elevadores:** exigir memorial descritivo completo, laudo do INMETRO/DRT pós-obra, ART.

---

## 2. BDI (Benefícios e Despesas Indiretas)

### O que é BDI
Percentual aplicado sobre o custo direto para cobrir: administração central, tributos, seguros, garantia, lucro.

### Faixas esperadas por porte de empresa
| Porte | BDI usual |
|---|---|
| MEI / microempresa informal | 0–15% (raramente declarado) |
| Pequena empresa (< 5 func.) | 15–25% |
| Média empresa | 25–35% |
| Grande empresa (engenharia) | 35–50% |

### Alertas de BDI
- **BDI não declarado:** orçamento com BDI = 0 é suspeito — empresa ou trabalha no informal (sem garantia) ou embutiu o BDI nos preços unitários (dificulta comparação).
- **BDI > 60%:** preço muito alto; perguntar composição detalhada.
- **BDI < 10% em empresa estruturada:** suspeito de dumping — pode falhar na entrega ou buscar aditivos.

---

## 3. CHECKLIST DOCUMENTAL OBRIGATÓRIO POR TIPO DE OBRA

### Toda obra acima de R$ 15.000
- [ ] CNPJ válido e ativo no Receita Federal
- [ ] Contrato escrito com escopo detalhado, prazo, forma de pagamento, multas
- [ ] ART ou RRT do responsável técnico (engenheiro ou arquiteto)
- [ ] Seguro de responsabilidade civil (opcional mas recomendável)

### Obras que exigem ART obrigatoriamente
- Qualquer serviço elétrico de média/alta tensão
- Estrutura, fundação, recuperação estrutural
- Impermeabilização de estruturas enterradas
- Instalação ou modernização de elevadores
- Instalações hidráulicas de combate a incêndio

### Garantia mínima por norma (NBR 15575 / Código Civil)
| Serviço | Garantia mínima |
|---|---|
| Impermeabilização | 5 anos |
| Pintura externa | 3 anos |
| Instalações elétricas | 3 anos |
| Estrutura (recuperação) | 5 anos |
| Elevadores | 1 ano pós-modernização |

**Red flag:** garantia < prazo mínimo da norma → exigir explicação por escrito.

---

## 4. PEGADINHAS CLÁSSICAS DE FORNECEDOR

### 4.1 Quantidade subestimada para ganhar na medição
- Orçamento com m² menor que a realidade. Ganham o contrato com preço baixo, cobram aditivo na obra.
- **Detectar:** comparar área declarada entre orçamentos. Divergência > 15% → pedir memória de cálculo.

### 4.2 "Verba" ou "serviço de apoio" sem detalhamento
- Linha de R$ 5.000 "verba para serviços complementares" sem especificação.
- **Regra:** qualquer item acima de R$ 2.000 sem descrição detalhada = pedir quebra de composição.

### 4.3 Exclusões em letra miúda (ou não declaradas)
- "Inclui mão de obra, material não incluso" — ou o contrário.
- Andaimes, caçamba, ART, "descarte de entulho" frequentemente excluídos.
- **Regra:** se não está explicitamente incluído, perguntar se está excluído.

### 4.4 Condições de pagamento leoninas
- Entrada > 30% sem material entregue = risco alto de abandono.
- **Red flag grave:** entrada > 50% para obra sem parcelas vinculadas a entrega.
- Pagamento total adiantado = recusar.
- Sem previsão de retenção de garantia (5–10% na última parcela) = desvantagem do condomínio.

### 4.5 Prazo indefinido ou "conforme andamento"
- Prazo de conclusão sem data = impossível aplicar multa.
- **Red flag:** ausência de prazo = recusar ou exigir inclusão antes de assinar.

### 4.6 Preço de material genérico ("tinta standard", "manta tipo A")
- Marca e especificação técnica ausentes = impossível controlar o que vai ser aplicado.
- Empresa usa o mais barato disponível — qualidade imprevisível.

### 4.7 Preço abaixo do mercado em > 30%
- Risco de: material de baixa qualidade, mão de obra não especializada, abandono de obra.
- Nunca escolher pelo menor preço sem investigar a diferença.
- **Perguntar:** "Como vocês chegaram a este preço? O que está excluído?"

---

## 5. FLAGS E SEMÁFOROS

| Flag | Critério | Cor |
|---|---|---|
| `ok` | Preço dentro da faixa ±20% | 🟢 |
| `acima_mercado` | Preço > faixa +20% | 🔴 |
| `abaixo_mercado` | Preço < faixa -25% | 🟡 |
| `ausente` | Item presente nos outros orçamentos mas não neste | 🔴 |
| `sem_detalhamento` | Quantidade ou preço unitário ausente | 🟡 |

---

## 6. TIPOS DE OBRA SUPORTADOS

Para inferência automática de itens esperados:
- `pintura_interna` — pintura de paredes/teto internas
- `pintura_fachada` — pintura ou textura de fachada externa
- `impermeabilizacao_laje` — laje de cobertura ou terraço
- `impermeabilizacao_subsolo` — reservatórios, garagem subterrânea
- `recuperacao_estrutural` — tratamento de fissuras, ferragem exposta, carbonatação
- `eletrica` — instalações elétricas, SPDA, quadros
- `elevador` — modernização ou manutenção de elevadores
- `jardim_paisagismo` — áreas externas, jardinagem
- `playground` — brinquedos e área kids
- `reforma_geral` — reforma ampla sem tipo específico

---

## 7. PERGUNTAS PADRÃO POR TIPO DE RED FLAG

### Preço muito acima do mercado
> "O valor por m² para [SERVIÇO] apresentado está [X]% acima da faixa de referência para SP. Poderiam detalhar a composição de custos (materiais + mão de obra + BDI) para justificar este valor?"

### Preço muito abaixo do mercado
> "O valor por m² está [X]% abaixo do esperado para este tipo de serviço. Gostaríamos de entender: (1) qual a marca/especificação dos materiais? (2) haverá subcontratação? (3) o prazo de garantia de [Y] anos está coberto neste valor?"

### Item ausente
> "Notamos que o orçamento de [EMPRESA] não inclui [ITEM]. Este item está excluído do escopo? Se sim, como será providenciado?"

### Sem ART declarada
> "Para este tipo de obra, a ART/RRT do responsável técnico é obrigatória. O custo da ART está incluído no orçamento? Quem é o engenheiro/arquiteto responsável?"

### Condição de pagamento suspeita
> "O pagamento de [X]% de entrada foi solicitado antes do início dos serviços. O condomínio prefere pagamentos vinculados ao avanço físico da obra. Vocês aceitam reformular as condições de pagamento?"

---

*Atualizado: jun/2026. Próxima revisão: dez/2026 ou após revisão do INCC.*
