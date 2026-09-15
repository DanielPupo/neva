# NEVA 1.1 — descida contínua

Jogo de snowboard em React Native + Expo SDK 57 + TypeScript, controlado pelo acelerômetro. Esta revisão reorganiza o MVP e troca o movimento simplificado por uma simulação com gravidade, inércia e pista contínua.

## Abrir no seu projeto

Extraia o ZIP em uma pasta nova. Se estiver substituindo a versão anterior, substitua o projeto completo: alguns arquivos antigos foram removidos e divididos em módulos. Preserve mudanças próprias antes de fazer a substituição.

Use Node.js 22.13+ e Expo Go compatível com SDK 57. Dentro da pasta `neva`:

```sh
npm ci
npx expo start --clear
```

Celular e computador devem estar na mesma rede. Leia o QR code e abra o jogo no Expo Go. A prévia web (`npm run web`) serve para conferir a interface; o jogo continua exigindo um sensor real, sem teclas ou botões de direção.

## O que mudou

- **Organização:** `App.tsx` apenas compõe o jogo e as telas. Configurações, física, colisões, geração, projeção, sensor, persistência e interface têm módulos próprios.
- **Manutenção:** estilos compartilhados, tipos únicos, catálogo único de obstáculos, formatação Prettier e exclusão do antigo `Art.tsx`. O renderer reutiliza uma arte por obstáculo, em vez de manter três versões sobrepostas.
- **Direção:** o sinal lateral é normalizado usando a gravidade registrada na calibragem. Inclinar fisicamente para a direita produz `right`, mesmo com convenções nativas de gravidade opostas. O cálculo utiliza a diferença angular em relação à posição neutra.
- **Pista contínua:** objetos têm posições em metros no mundo. A distância do personagem determina o deslocamento aparente de obstáculos, árvores laterais, sulcos da neve e rastros da prancha.
- **Aproximação:** obstáculos são preparados à frente da área visível. Surgem gradualmente na névoa entre 220 e 160 metros, aumentam pela perspectiva e só são reciclados depois de passar pela câmera.
- **Física:** gravidade, impulso vertical, aceleração da descida, atrito, resistência proporcional ao quadrado da velocidade, inércia lateral e amortecimento. Aterrissagem comprime brevemente o personagem; não há salto duplo.
- **Colisões:** volumes em coordenadas do mundo e simulação a 120 passos/segundo. Árvores/pedras exigem desvio; troncos exigem altura suficiente para passar por cima.
- **Visual:** pinheiros com camadas de neve, rochas com faces e fissuras, troncos com anéis e casca, roupa/helmet/prancha com sombreamento, perspectiva compartilhada e ordem de profundidade.

O visual é **2,5D estilizado**, com mais volume e detalhes; não é renderização 3D fotorrealista. As grandezas físicas são usadas numa simulação de jogo, não num simulador esportivo validado.

## Controles

1. Segure o aparelho em retrato, com a tela voltada para você, e fique parado por 1 segundo.
2. Toque em **Calibrar e descer**. A calibragem rejeita postura quase horizontal, ruído excessivo ou amostras insuficientes.
3. Incline para a direita/esquerda para mudar uma faixa nessa direção.
4. Volte à posição neutra para habilitar a próxima mudança.
5. Eleve brevemente o celular para saltar. O sinal do impulso também é normalizado pela calibragem.
6. Use pausa para continuar, recalibrar, reiniciar ou sair.

A troca de aplicativo pausa a partida e remove a assinatura do sensor. Continuar aguarda amostras recentes antes de mover o mundo. Se o sensor parar, a partida pausa com uma mensagem. O diagnóstico opcional no menu mostra eixos, inclinação normalizada, faixa, altura e velocidade vertical.

## Onde alterar cada comportamento

| Necessidade | Arquivo |
| --- | --- |
| Gravidade, impulso, velocidade e sensibilidade | `src/config/game.ts` |
| Cores compartilhadas | `src/config/theme.ts` |
| Tipos e catálogo de obstáculos | `src/types/game.ts` |
| Regras e passo fixo do jogo | `src/core/game.ts` |
| Salto, inércia e aceleração | `src/core/physics.ts` |
| Tamanhos e regras de colisão | `src/core/collision.ts` |
| Fileiras e reciclagem de obstáculos | `src/core/world.ts` |
| Direção, filtro e reconhecimento de gestos | `src/core/sensor.ts` |
| Permissões, amostras e disponibilidade do sensor | `src/hooks/useAccelerometer.ts` |
| Navegação, pausa e início/fim de partida | `src/hooks/useGameController.ts` |
| Recordes e fila de gravações | `src/hooks/useRecords.ts`, `src/services/storage.ts` |
| Câmera e projeção | `src/rendering/projection.ts` |
| Posicionamento das animações | `src/rendering/motion.ts` |
| Composição do mundo em movimento | `src/components/GameView.tsx` |
| Artes de cenário, personagem e obstáculos | `src/components/art/` |
| Menus e telas | `src/screens/` |
| Botões, painéis e estilos de interface reutilizáveis | `src/components/ui/Controls.tsx` |

A renderização usa `Animated.Value` e referências. As atualizações de HUD ocorrem aproximadamente a cada 160 ms; o mundo não depende de renderizações React a cada frame. A simulação tem passo fixo de 1/120 s e limita recuperação de frames longos a 100 ms. O alvo visual é 60 FPS, ainda sem medição em aparelho.

## Física e geração

- Salto: `altura += velocidadeVertical × dt − 0,5 × gravidade × dt²`.
- Gravidade: 9,81 m/s²; impulso inicial: 5,3 m/s; altura teórica máxima: aproximadamente 1,43 m; voo: aproximadamente 1,08 s.
- Direção: mola criticamente amortecida em direção ao centro da faixa; menor capacidade de virar durante o salto.
- Descida: componente da gravidade na inclinação, menos atrito e arrasto. Velocidade limitada a 24 m/s.
- Fileiras: um obstáculo por fileira, duas faixas livres, 58–70 m de espaçamento. No limite de velocidade, há pelo menos 2,4 s entre fileiras.
- A prancha deixa rastros apenas em contato com o chão. Sombras permanecem na pista durante o salto.
- Pontos: distância inteira em metros simulados. Recordes existentes continuam na mesma chave local (`neva.records.v1`).

## Verificações

```sh
npm run typecheck
npm test
npm run format:check
npx expo export --platform all
```

Foram verificados TypeScript, 17 testes de lógica e geração dos bundles Android, iOS e web. Os testes cobrem direção nos dois sinais de gravidade, histerese, ruído, calibragem, salto, gravidade, inércia, limites das faixas, ausência de salto duplo, consistência a 30/60/120 FPS, colisões em alta velocidade, geração fora da área visível e limite de velocidade.

Artes e composição em perspectiva foram inspecionadas em imagens estáticas de 390×844 e 320×568. Isso não substitui teste da interface animada no Expo Go. Não foi possível executar uma sessão gráfica nativa ou medir o desempenho e os gestos num aparelho físico neste ambiente.

### Conferir no celular

- Calibrar em repouso e mover para cada lado; conferir direção real.
- Segurar a inclinação: apenas uma troca; voltar ao neutro e repetir.
- Saltar um tronco, aterrissar e confirmar que árvores/pedras ainda exigem desvio.
- Observar a aproximação dos objetos, o deslocamento da neve e as árvores laterais.
- Pausar durante salto/curva e sair para outro app: física e distância devem congelar.
- Recalibrar, retomar, reiniciar e confirmar a persistência do recorde após fechar o app.

## Referências de compatibilidade

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Accelerometer](https://docs.expo.dev/versions/v57.0.0/sdk/accelerometer/)

Combos, Near Miss, modo Zen, treinamento e análise de equilíbrio não fazem parte desta revisão.
