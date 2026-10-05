# 🎮 GDD — BlobSling Shenanigans

**Nome Comercial**: BlobSling Shenanigans (Inédito e Inovador)  
**Gênero / Estilo**: Physics Puzzles / Ragdoll Casual  
**Plataforma Alvo**: CrazyGames (HTML5 / WebGL)  
**URL de Entrega / Produção**: [https://blobslingshenanigans.kinomuse.com.br](https://blobslingshenanigans.kinomuse.com.br)  
**Stack Tecnológica**: Vite + Phaser 3 (HTML5 Canvas)  
**Data de Concepção**: 05/10/2026 18:00  
**Arquiteta Mestre de Criação**: Esmeralda (GLX Agent)  

---

## 🌟 1. Identidade de Marca & Introdução Obrigatória
1. **Intro FluidCleb Interactive (0.0s a 2.8s)**:
   - Splash Screen procedural obrigatória em Canvas idêntica aos títulos de referência (*Sobrevivente da Névoa* e *Hydrologic*).
   - Orbes de energia azul subindo (`#00f5ff`, `#38bdf8`, `#0284c7`), fusão central com áudio sintético procedural (`playFluidClebIntro()`), emblema da gota d'água metálica (`#94a3b8` / `#0284c7`), logo em neon `FLUIDCLEB` (38px) e subtítulo `INTERACTIVE` (13px), com barra de progresso suave.
2. **Apresentação em Animação Realista (Intro Narrativa / Lore Interativa)**:
   - Exibida imediatamente após a Splash Screen da FluidCleb.
   - Animação cinematográfica procedural em Canvas com partículas volumétricas, feixes de luz e transição dramática que narra os 3 atos da Lore em até 5 segundos com botões 'Continuar ➔' e 'Pular História'.

---

## 📖 2. Lore, Ambientação & Premissa
Criaturas gelatinosas, os 'Blobs', precisam alcançar portais mágicos. Mas eles estão presos em labirintos repletos de armadilhas, superfícies pegajosas e obstáculos desafiadores. Com um estilingue místico, você deve lançá-los e usar a física do ambiente para guiá-los à liberdade.

---

## ⚡ 3. Core Gameplay Loop & Controles
O jogador usa um estilingue para lançar Blobs gelatinosos através de labirintos. O objetivo é fazer os Blobs quicarem, deslizarem e aderirem a superfícies para alcançar um portal mágico. Níveis rápidos de 30 segundos, com opção de pular fase via Rewarded Ad. Controles simples de arrastar e soltar para o estilingue.

---

## 🧩 4. Módulos & Features Aprovados para o Jogo
- **Mecânica de Estilingue Preciso e Física de Blobs (quicar, deslizar, aderir)**
- **Habilidade dos Blobs de se Dividir em Mini-Blobs para passar por espaços apertados**
- **Níveis Rápidos de 30 Segundos**
- **Opção de Pular Fase com Rewarded Ad**
- **Poderes Especiais para os Blobs (ex: Blob Explosivo, Blob Grudento, Blob de Gelo) ativáveis em momentos chave**
- **Modo Infinito com desafios procedurais e placares de líderes globais**
- **Eventos Diários/Semanais com desafios únicos e recompensas temporárias**
- **Intro FluidCleb Interactive (Splash Screen procedural obrigatória em Canvas com orbes subindo, fusão central, emblema da gota metálica, logo em neon ciano e áudio sintético)**
- **Apresentação em Animação Realista da Lore (introdução narrativa cinematográfica de 5 segundos)**
- **CrazyGames SDK v3 (Suporte completo a Rewarded Ads: Revive 1x com 3s invulnerabilidade e Dobrar moedas/XP no final; Midgame Ads nas telas de vitória/derrota; eventos gameplayStart/Stop)**
- **URL de Entrega Pública: blobslingshenanigans.kinomuse.com.br (via túnel Cloudflare)**
- **Repositório GitHub Obrigatório (Nome: BlobSling_Shenanigans, visibilidade pública, commits contínuos)**
- **Validação por 2 Subagentes ao Concluir (Subagente 1: Validando mecânica, física, colisões e fluidez a 60 FPS; Subagente 2: Validando jogabilidade, polimento gráfico, HUD responsivo e integração perfeita do SDK CrazyGames)**

---

## 💰 5. Estratégia de Monetização de Alto Rendimento (CrazyGames SDK v3)
Rewarded Ads: Pular fase (após falha ou desafio), Dica para resolver o puzzle, Dobrar moedas/XP no final do nível. Midgame Ads nas telas de vitória/derrota.

---

## 🛡️ 6. Protocolo de Validação de Qualidade por 2 Subagentes (QA)
- **Subagente 1 (Mecânica & Fluidez)**: Validação de 60 FPS constantes, física sem travamentos, movimentação precisa, colisão e gerenciamento eficiente de memória.
- **Subagente 2 (Jogabilidade & CrazyGames SDK)**: Validação de interface/HUD responsiva sem sobreposição, efeitos visuais nítidos e chamada correta dos métodos do SDK (`gameplayStart`, `gameplayStop`, `requestAd`).
