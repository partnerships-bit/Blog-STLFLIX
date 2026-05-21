# Como funciona o STLFLIX Blog Generator
*Explicado para quem não programa — sem jargão técnico*

*Última atualização: 14/05/2026 (v2 — bilíngue automático)*

---

## 🎯 O que esse projeto faz, em uma frase

**Você cola o link de um vídeo do YouTube → o sistema te devolve DOIS artigos de blog prontos, otimizados para o Google: um em português (Brasil) e outro em inglês (global), em cerca de 1-2 minutos.**

Você não precisa transcrever, não precisa escrever, não precisa pesquisar SEO, não precisa traduzir. É só colar a URL e clicar.

---

## ✨ O que mudou desde a primeira versão (v2)

A primeira versão entregava 1 artigo em pt-BR. A v2 entrega **2 artigos sempre** — pt-BR e inglês — gerados **ao mesmo tempo** (não em fila). O sistema pede pra IA escrever os dois em paralelo, então o tempo total praticamente não muda: continua ~1-2 minutos.

Depois que os dois artigos ficam prontos, o editor abre com **duas abas grandes** no topo (PT-BR | English). Você clica numa, edita; clica na outra, edita. **As edições não se perdem** quando você troca de aba — cada idioma tem sua memória independente.

Cada artigo é salvo separado no banco com sua própria URL pública. Você publica os dois no Hashnode quando quiser (PT em um endereço, EN em outro).

Por baixo dos panos isso significa que o Claude (a IA redatora) é chamado **duas vezes por geração** — uma com instruções em português, outra em inglês. Custo dobra. Tempo não dobra (paralelismo).

---

## 🧠 Por que esse projeto existe

A STLFLIX é a maior plataforma educacional de impressão 3D do Brasil. Vocês produzem vídeos no YouTube com muito conteúdo bom, e quem chega pelo Google via blog continua sendo o canal mais barato e duradouro de aquisição.

O problema: transformar cada vídeo em artigo de blog leva **horas** — assistir, transcrever, reorganizar, escrever em formato SEO. Em outro idioma, dobra. Isso quase nunca acontece, e o conteúdo dos vídeos fica preso no YouTube.

Esse projeto resolve isso: ele faz **automaticamente** o trabalho que demoraria 4-6h por vídeo (2-3h em PT + outro tanto pra adaptar pra EN) em ~1-2 minutos, e em dois idiomas.

**Por que inglês também?** O mercado de busca em inglês para impressão 3D é dezenas de vezes maior que o brasileiro. Mesma matéria-prima (a transcrição), mesmo trabalho editorial humano (revisão), alcance global. Os concorrentes em inglês (All3DP, Prusa, Bambu Lab) dominam o SERP e nunca aparece a STLFLIX — a v2 corrige isso.

---

## 🧩 As peças do projeto (e o que cada uma faz)

Imagine um **restaurante**. Quando você pede um prato, várias pessoas trabalham nos bastidores: garçom anota o pedido, cozinheiro prepara, fornecedor entrega ingredientes, etc. Cada um tem uma função.

No nosso "restaurante digital", essas são as peças:

### 1. 🍽️ Next.js — *o garçom (o que você vê na tela)*

É o software que cria a **página web** que você abre no navegador: o campo onde você cola a URL, a barra de progresso, a tela com os dois artigos gerados (com as abas PT-BR e EN).

**Por que esse?** É o framework mais popular do mundo para sites em React, mantido pela mesma empresa que vamos usar pra hospedar (Vercel). Tem suporte nativo para "streaming" — que é o que faz a barra de progresso atualizar em tempo real enquanto o vídeo está sendo processado.

### 2. 🎧 yt-dlp — *o extrator de áudio*

O YouTube **não deixa** você baixar o áudio dos vídeos facilmente. O `yt-dlp` é uma ferramenta que sabe contornar isso — ela baixa só a faixa de áudio (não o vídeo completo) e nos entrega o arquivo.

**Por que essa?** É o padrão de fato. O YouTube muda os mecanismos de proteção toda semana, e o yt-dlp é mantido por uma comunidade gigante que atualiza essas adaptações constantemente. Tentamos primeiro uma alternativa em JavaScript (`ytdl-core`) e o YouTube bloqueou (erro 429 — "muitos pedidos"). O `yt-dlp` aguentou.

**Mudança da v2:** o yt-dlp agora roda dentro de uma **função Python na Vercel** (`api/download-audio.py`) — não mais só no seu computador. Isso resolveu o problema "não tem Python na Vercel" que existia na v1. Mas trouxe outro problema novo (ver "Bloqueador" mais abaixo): o YouTube bloqueia os IPs da Vercel.

### 3. 📝 AssemblyAI — *o transcritor*

Recebe o áudio que o yt-dlp baixou e devolve o **texto completo** do que foi falado no vídeo, em português.

**Por que essa?** Foi a melhor opção em três critérios:
- **Qualidade em pt-BR**: bem mais precisa que o Whisper da OpenAI ou as legendas automáticas do YouTube.
- **Velocidade**: transcreve um vídeo de 10 min em ~30 segundos.
- **Custo**: ~$0.012 por minuto de áudio — barato pra escala da STLFLIX.

**Observação importante:** o AssemblyAI transcreve sempre o **áudio original em português** (a STLFLIX fala português nos vídeos). Para o artigo em inglês, é o Claude que faz a tradução + reescrita SEO. Não duplicamos a transcrição.

### 4. ✍️ Claude (Anthropic) — *o redator (agora trabalha em dupla)*

Essa é a parte mais "mágica". O Claude (modelo de IA da Anthropic) recebe a transcrição bruta do vídeo e a transforma em um **artigo de blog completo**: título SEO, meta-descrição, corpo com 800+ palavras, subtítulos H2, 5 keywords long-tail, TL;DR, FAQ.

**Mudança da v2:** o Claude agora é chamado **duas vezes em paralelo** — uma com instruções em português ("escreva em pt-BR, use '## Glossário' no fim, cite 'Segundo a STLFLIX...'") e outra em inglês ("write in English global, use '## Glossary' at the end, cite 'According to STLFLIX...'"). As duas chamadas rodam ao mesmo tempo, então o tempo total é igual ao de uma só.

**Por que o Claude?**
- A versão `claude-sonnet-4-6` é a melhor IA para escrita técnica em ambos os idiomas hoje. Em pt-BR é claramente superior ao GPT-4 para o tom educativo-prático da STLFLIX; em inglês neutro/global também entrega bem.
- Suporta "prompt caching": as instruções de tom/estilo ficam guardadas no servidor da Anthropic — economiza ~70% no custo de regenerações do mesmo idioma. (Entre PT e EN não cacheia, porque as instruções são diferentes.)
- Suporta "tool use": uma forma de garantir que a IA SEMPRE devolva o resultado num formato estruturado (título separado, corpo separado, etc.), sem erros de formatação. Esse foi um bug que tivemos na v1 e o tool_use resolveu definitivamente.

### 5. 🗄️ Supabase — *o arquivo (banco de dados)*

Tudo que o sistema gera fica guardado em três "gavetas":
- **transcriptions** — guarda cada transcrição com o ID do vídeo. Se você pedir o mesmo vídeo de novo, ele pula o AssemblyAI (que é a parte mais cara) e usa a transcrição que já tem.
- **articles** — guarda cada artigo gerado. **Agora com uma coluna nova `language`** (pt-BR ou en) que diz em qual idioma cada artigo foi escrito.
- **generation_logs** — registra cada tentativa (sucesso ou erro), pra você ter histórico. **Cada geração bem-sucedida insere 2 linhas** (uma por idioma).

**Por que esse?** É o concorrente open-source do Firebase, com um Postgres por baixo (banco de dados que é padrão da indústria). Tem plano gratuito generoso, console web bonito, e API simples.

### 6. ☁️ Vercel — *o estúdio que coloca tudo no ar*

Tudo isso roda no seu computador agora (localhost:3000). Para o time da STLFLIX usar, precisa estar **na internet**. A Vercel é a empresa que pega o código do GitHub e disponibiliza num endereço público (https://blog-stlflix.vercel.app).

**Por que essa?** Foi feita pela mesma empresa do Next.js — então a integração é perfeita. Faz deploy automático a cada commit. Plano pago (Pro) era necessário porque a geração leva 1-2 minutos e o plano grátis tem limite de 10s por request.

---

## 🔄 O passo a passo quando você usa (v2 — bilíngue)

```
[VOCÊ]
  │
  │ 1. Cola URL do YouTube e clica "Gerar artigo"
  ▼
[NEXT.JS — o garçom]
  │
  │ 2. Valida a URL e abre uma "linha telefônica" com o servidor
  │    (essa linha é o que faz a barra de progresso funcionar)
  ▼
[SUPABASE — o arquivo]
  │
  │ 3. Tem essa transcrição guardada?
  │    SE SIM → pula direto pro passo 7 (cache hit)
  │    SE NÃO → continua
  ▼
[YT-DLP (função Python na Vercel) — extrator de áudio]
  │
  │ 4. Baixa só o áudio do vídeo do YouTube (.m4a, ~10-30MB)
  ▼
[ASSEMBLYAI — transcritor]
  │
  │ 5. Recebe o áudio, transcreve para texto em pt-BR
  │    Demora ~30s pra um vídeo de 10min
  ▼
[SUPABASE — o arquivo]
  │
  │ 6. Guarda a transcrição no banco (pra economizar da próxima)
  ▼
[CLAUDE — redator (×2 em paralelo) ⭐ NOVO NA V2]
  │
  │ 7a. Chamada PT: recebe transcrição + instruções em português
  │     Devolve artigo em pt-BR: título, meta, corpo, TL;DR, FAQ, keywords
  │ 7b. Chamada EN: recebe a MESMA transcrição + instruções em inglês
  │     Devolve artigo em English: title, meta, body, TL;DR, FAQ, keywords
  │     (as duas chamadas rodam ao mesmo tempo — ~30-60s)
  ▼
[SUPABASE — o arquivo]
  │
  │ 8. Guarda OS DOIS artigos no banco (cada um com seu language)
  │    Registra 2 linhas em generation_logs (1 por idioma)
  ▼
[VOCÊ]
  │
  │ 9. Vê os DOIS artigos na tela com abas grandes PT-BR / EN no topo
  │    Edita um, troca de aba, edita o outro, troca de volta —
  │    as edições ficam preservadas
  │    Copia cada idioma como Markdown ou HTML
  │    Clica "Regenerar (PT + EN)" se não gostou — gera novo par
```

---

## 📍 Onde estamos agora (14/05/2026)

### ✅ Funciona localmente (no seu computador)

Quando rodo `npm run dev` na sua máquina:
- Cola URL do YouTube → recebe **dois artigos** prontos (PT + EN). Validado ponta a ponta.
- As abas no editor preservam edições — testado manualmente.
- Cache de transcrições funciona (regerar mesmo vídeo é instantâneo na parte do AssemblyAI; só o Claude roda de novo).
- Dashboard mostra cada idioma como linha separada com badge colorido (PT-BR verde, EN azul).

### ✅ Código enviado para o GitHub

Todo o código está em https://github.com/partnerships-bit/Blog-STLFLIX. A versão v2 está no commit `85fd393` na branch `main`.

### ✅ Vercel preparada

- Projeto criado: `blog-stlflix` (https://blog-stlflix.vercel.app)
- Todas as chaves de API configuradas (Anthropic, AssemblyAI, Supabase URL e Key)
- Função Python na Vercel pra rodar o yt-dlp já está deployada
- CLI instalada e linkada localmente

---

## ⚠️ O bloqueador para usar em produção (ATUALIZADO)

**Mudou desde a v1.** Antes o problema era "Vercel não tem Python pra rodar yt-dlp". Isso foi resolvido — agora tem uma função Python na Vercel que roda o yt-dlp normalmente.

**O novo problema:** o **YouTube bloqueia os IPs da Vercel.** Os servidores da Vercel ficam em datacenters da AWS, e o YouTube reconhece esses IPs como "tráfego de robô" e bloqueia com a mensagem:

> *"Sign in to confirm you're not a bot. Use --cookies-from-browser or --cookies..."*

Resultado: se você abrir https://blog-stlflix.vercel.app agora e tentar gerar um artigo, o sistema baixa o áudio até esbarrar nesse bloqueio. Localmente funciona porque o seu computador tem um IP residencial normal, e o YouTube confia.

**As opções para resolver:**

| Opção | O que é | Custo | Esforço |
|---|---|---|---|
| **A. Proxy Webshare residential** (recomendada) | Compra acesso a IPs residenciais e o yt-dlp passa por eles | ~$3-5/mês | Baixo. Setar 1 env var na Vercel |
| **B. Cookies do YouTube logado** | Exportar cookies de uma sessão logada e enviar pro yt-dlp | $0 | Médio. Cookies expiram em 2-4 semanas, precisa renovar |
| **C. Microserviço Railway/Render** | Subir a função de áudio em outro provedor com IPs diferentes | ~$5/mês | Maior. Mais infra pra cuidar |
| **D. Legendas automáticas do YouTube** | Pular yt-dlp + AssemblyAI, usar legendas que o YouTube já gera | $0 | Baixo. Karol vetou — quer manter qualidade do AssemblyAI |

**Status:** Karol já decidiu pela **opção A (Webshare proxy ~$3/mês)** mas ainda não comprou. O código já está preparado — basta cadastrar a URL do proxy como variável de ambiente `YOUTUBE_PROXY_URL` na Vercel e funciona automaticamente.

---

## 💰 Custo estimado em produção (v2 — bilíngue)

Para 100 vídeos por mês (= 200 artigos: 100 PT + 100 EN):

| Serviço | Custo |
|---|---|
| Vercel Pro | $20/mês |
| Anthropic (Claude) — **2 chamadas por vídeo** | ~$8-12/mês (com prompt caching) |
| AssemblyAI | ~$1-2/mês (transcrição é 1 vez só por vídeo) |
| Supabase | $0 (plano grátis aguenta tranquilo) |
| Webshare proxy (quando configurar) | ~$3-5/mês |
| **Total** | **~$32-39/mês** |

**Comparação com v1 (só pt-BR):** v1 daria ~$26-27/mês. v2 sobe pra ~$32-39/mês — **diferença de ~$6-12/mês para dobrar o alcance** (PT + EN). Bom trade-off.

---

## 🔐 O que está protegido

Suas chaves de API (que custam dinheiro se vazarem) **não** estão no GitHub. Elas ficam em:
- No seu computador: arquivo `.env` (que o `.gitignore` exclui).
- Na Vercel: variáveis de ambiente criptografadas.

O repositório no GitHub tem só o código, sem credenciais.

---

## 📚 Glossário rápido

- **API key**: senha de acesso a um serviço externo (tipo AssemblyAI). Quem tem ela, usa o serviço — e quem paga a conta é o dono.
- **BCP47** (códigos `pt-BR`, `en`): padrão internacional de códigos de idioma usado em SEO/JSON-LD. `pt-BR` = português do Brasil. `en` = inglês global (sem variação regional).
- **Cache**: lembrar respostas anteriores pra não precisar refazer o trabalho.
- **Deploy**: colocar o software no ar pra outras pessoas usarem.
- **Env var (variável de ambiente)**: um valor (geralmente senha) que o código lê mas que não fica salvo no código em si.
- **JSON-LD**: marcação invisível que o Google e LLMs leem pra entender o que tem no artigo (autor, idioma, FAQ, etc.). Cada idioma tem o seu.
- **Markdown**: jeito simples de escrever texto formatado (com `#` pra título, `**` pra negrito).
- **Migration**: arquivo que adiciona uma coluna ou tabela no banco. A v2 trouxe a migration `0003_article_language.sql` que adicionou o campo `language`.
- **Paralelismo**: rodar duas tarefas ao mesmo tempo. É o que faz as duas chamadas Claude (PT + EN) demorarem o tempo de uma só.
- **Proxy residencial**: serviço que empresta IPs domésticos comuns pra que requisições "pareçam" vir de pessoa normal, não de servidor.
- **Repositório**: pasta onde o código fica versionado (no nosso caso, no GitHub).
- **Serverless function**: jeito da Vercel rodar código sob demanda, sem ter um servidor ligado o tempo todo.
- **SEO**: técnicas pra fazer o artigo aparecer no Google quando alguém pesquisa um assunto.
- **GEO** (Generative Engine Optimization): versão moderna do SEO — fazer com que LLMs (ChatGPT, Claude, Perplexity) citem o artigo da STLFLIX como fonte ao responder perguntas.
- **Streaming**: jeito de mandar dados aos poucos pra interface, em vez de só no final (é o que faz a barra de progresso funcionar).
- **Transcrição**: converter áudio falado em texto escrito.
