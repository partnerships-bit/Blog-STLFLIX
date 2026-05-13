# Como funciona o STLFLIX Blog Generator
*Explicado para quem não programa — sem jargão técnico*

---

## 🎯 O que esse projeto faz, em uma frase

**Você cola o link de um vídeo do YouTube → o sistema te devolve um artigo de blog pronto, otimizado para o Google, em pt-BR, em cerca de 1 minuto.**

Você não precisa transcrever, não precisa escrever, não precisa pesquisar SEO. É só colar a URL e clicar.

---

## 🧠 Por que esse projeto existe

A STLFLIX é a maior plataforma educacional de impressão 3D do Brasil. Vocês produzem vídeos no YouTube com muito conteúdo bom, e quem chega pelo Google via blog continua sendo o canal mais barato e duradouro de aquisição.

O problema: transformar cada vídeo em artigo de blog leva **horas** — assistir, transcrever, reorganizar, escrever em formato SEO. Isso quase nunca acontece, e o conteúdo dos vídeos fica preso no YouTube.

Esse projeto resolve isso: ele faz **automaticamente** o trabalho que demoraria 2-3h por vídeo em ~1 minuto.

---

## 🧩 As peças do projeto (e o que cada uma faz)

Imagine um **restaurante**. Quando você pede um prato, várias pessoas trabalham nos bastidores: garçom anota o pedido, cozinheiro prepara, fornecedor entrega ingredientes, etc. Cada um tem uma função.

No nosso "restaurante digital", essas são as peças:

### 1. 🍽️ Next.js — *o garçom (o que você vê na tela)*

É o software que cria a **página web** que você abre no navegador: o campo onde você cola a URL, a barra de progresso, a tela com o artigo gerado.

**Por que esse?** É o framework mais popular do mundo para sites em React, mantido pela mesma empresa que vamos usar pra hospedar (Vercel). Tem suporte nativo para "streaming" — que é o que faz a barra de progresso atualizar em tempo real enquanto o vídeo está sendo processado.

### 2. 🎧 yt-dlp — *o extrator de áudio*

O YouTube **não deixa** você baixar o áudio dos vídeos facilmente. O `yt-dlp` é uma ferramenta que sabe contornar isso — ela baixa só a faixa de áudio (não o vídeo completo) e nos entrega o arquivo.

**Por que essa?** É o padrão de fato. O YouTube muda os mecanismos de proteção toda semana, e o yt-dlp é mantido por uma comunidade gigante que atualiza essas adaptações constantemente. Tentamos primeiro uma alternativa em JavaScript (`ytdl-core`) e o YouTube bloqueou (erro 429 — "muitos pedidos"). O `yt-dlp` aguentou.

### 3. 📝 AssemblyAI — *o transcritor*

Recebe o áudio que o yt-dlp baixou e devolve o **texto completo** do que foi falado no vídeo, em português.

**Por que essa?** Foi a melhor opção em três critérios:
- **Qualidade em pt-BR**: bem mais precisa que o Whisper da OpenAI ou as legendas automáticas do YouTube.
- **Velocidade**: transcreve um vídeo de 10 min em ~30 segundos.
- **Custo**: ~$0.012 por minuto de áudio — barato pra escala da STLFLIX.

### 4. ✍️ Claude (Anthropic) — *o redator*

Essa é a parte mais "mágica". O Claude (modelo de IA da Anthropic) recebe a transcrição bruta do vídeo e a transforma em um **artigo de blog completo**: título SEO, meta-descrição, corpo com 800+ palavras, subtítulos H2, 5 keywords long-tail.

**Por que esse?**
- A versão `claude-sonnet-4-6` é a melhor IA para escrita em pt-BR hoje (segundo testes que fiz, melhor que GPT-4 para o tom educativo-prático que a STLFLIX usa).
- Suporta "prompt caching": as instruções de tom/estilo que mando para ele ficam guardadas no servidor da Anthropic, então cada novo artigo custa **70% menos** do que custaria se eu reenviasse tudo toda vez.
- Suporta "tool use": uma forma de garantir que a IA SEMPRE devolva o resultado num formato estruturado (título separado, corpo separado, etc.), sem erros de formatação. Esse foi um bug que tivemos hoje e o tool_use resolveu definitivamente.

### 5. 🗄️ Supabase — *o arquivo (banco de dados)*

Tudo que o sistema gera fica guardado em três "gavetas":
- **transcriptions** — guarda cada transcrição com o ID do vídeo. Se você pedir o mesmo vídeo de novo, ele pula o AssemblyAI (que é a parte mais cara) e usa a transcrição que já tem.
- **articles** — guarda cada artigo gerado.
- **generation_logs** — registra cada tentativa (sucesso ou erro), pra você ter histórico.

**Por que esse?** É o concorrente open-source do Firebase, com um Postgres por baixo (banco de dados que é padrão da indústria). Tem plano gratuito generoso, console web bonito, e API simples.

### 6. ☁️ Vercel — *o estúdio que coloca tudo no ar*

Tudo isso roda no seu computador agora (localhost:3000). Para o time da STLFLIX usar, precisa estar **na internet**. A Vercel é a empresa que pega o código do GitHub e disponibiliza num endereço público (https://blog-stlflix.vercel.app).

**Por que essa?** Foi feita pela mesma empresa do Next.js — então a integração é perfeita. Faz deploy automático a cada commit. Plano pago (Pro) era necessário porque a geração leva 1-2 minutos e o plano grátis tem limite de 10s por request.

---

## 🔄 O passo a passo quando você usa

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
[YT-DLP — extrator de áudio]
  │
  │ 4. Baixa só o áudio do vídeo do YouTube (.webm, ~10-30MB)
  ▼
[ASSEMBLYAI — transcritor]
  │
  │ 5. Recebe o áudio, transcreve para texto
  │    Demora ~30s pra um vídeo de 10min
  ▼
[SUPABASE — o arquivo]
  │
  │ 6. Guarda a transcrição no banco (pra economizar da próxima)
  ▼
[CLAUDE — redator]
  │
  │ 7. Recebe a transcrição + instruções de tom da STLFLIX
  │    Devolve: título, meta-descrição, corpo em Markdown, keywords
  │    Demora ~20-40s
  ▼
[SUPABASE — o arquivo]
  │
  │ 8. Guarda o artigo gerado
  ▼
[VOCÊ]
  │
  │ 9. Vê o artigo na tela, pode editar, pode copiar como
  │    Markdown ou HTML, pode "regerar" se não gostou
```

---

## 📍 Onde estamos agora (08/05/2026)

### ✅ Funciona localmente (no seu computador)

Quando rodo `npm run dev` na sua máquina:
- Cola URL do YouTube → recebe artigo pronto. Validado ponta a ponta hoje.
- Cache de transcrições funciona (regerar mesmo vídeo é instantâneo).
- Dashboard mostra os últimos artigos gerados.

### ✅ Código enviado para o GitHub

Todo o código está em https://github.com/partnerships-bit/Blog-STLFLIX (commit `c4b8f99`).

### ✅ Vercel preparada

- Projeto criado: `blog-stlflix` (https://blog-stlflix.vercel.app)
- Todas as 4 chaves de API configuradas (Anthropic, AssemblyAI, Supabase URL e Key)
- CLI instalada e linkada localmente

---

## ⚠️ O bloqueador para usar em produção

**O problema:** o `yt-dlp` é um programa Python que roda no computador. Na Vercel, cada vez que alguém usa o app, o código é executado num "computador virtual descartável" (chamado *serverless function*) que **não tem Python instalado** e **não tem o yt-dlp**.

Resultado: se você abrir https://blog-stlflix.vercel.app agora e tentar gerar um artigo, vai falhar logo no primeiro passo (baixar o áudio).

**As opções para resolver:**

| Opção | O que é | Custo | Esforço |
|---|---|---|---|
| **A. Empacotar yt-dlp na Vercel** | Subir o binário (~30MB) junto com o código | $0 extra | Médio. Risco: YouTube às vezes bloqueia IPs de datacenter |
| **B. API de transcrição externa** | Usar serviço pronto (Supadata, RapidAPI) que entrega o texto direto | ~$10-30/mês | Baixo. Mais confiável |
| **C. Legendas automáticas do YouTube** | Pegar as legendas que o próprio YouTube gera | $0 | Baixo. Qualidade depende do vídeo |
| **D. Microserviço separado** | Subir o yt-dlp em outro servidor (Railway/Render) | ~$5/mês | Maior. Mais infra |

Você ainda precisa escolher uma dessas para o app funcionar de verdade na Vercel.

---

## 💰 Custo estimado em produção

Para 100 artigos por mês (estimativa baseada no PRD):

| Serviço | Custo |
|---|---|
| Vercel Pro | $20/mês |
| Anthropic (Claude) | ~$5/mês (com prompt caching) |
| AssemblyAI | ~$1-2/mês (vídeos de 10min, $0.012/min) |
| Supabase | $0 (plano grátis aguenta tranquilo) |
| **Total** | **~$26-27/mês** |

Mais o custo da opção de "yt-dlp na Vercel" se você escolher uma paga (B ou D).

---

## 🔐 O que está protegido

Suas chaves de API (que custam dinheiro se vazarem) **não** estão no GitHub. Elas ficam em:
- No seu computador: arquivo `.env` (que o `.gitignore` exclui).
- Na Vercel: variáveis de ambiente criptografadas.

O repositório no GitHub tem só o código, sem credenciais.

---

## 📚 Glossário rápido

- **API key**: senha de acesso a um serviço externo (tipo AssemblyAI). Quem tem ela, usa o serviço — e quem paga a conta é o dono.
- **Cache**: lembrar respostas anteriores pra não precisar refazer o trabalho.
- **Deploy**: colocar o software no ar pra outras pessoas usarem.
- **Env var (variável de ambiente)**: um valor (geralmente senha) que o código lê mas que não fica salvo no código em si.
- **Markdown**: jeito simples de escrever texto formatado (com `#` pra título, `**` pra negrito).
- **Repositório**: pasta onde o código fica versionado (no nosso caso, no GitHub).
- **Serverless function**: jeito da Vercel rodar código sob demanda, sem ter um servidor ligado o tempo todo.
- **SEO**: técnicas pra fazer o artigo aparecer no Google quando alguém pesquisa um assunto.
- **Streaming**: jeito de mandar dados aos poucos pra interface, em vez de só no final (é o que faz a barra de progresso funcionar).
- **Transcrição**: converter áudio falado em texto escrito.
