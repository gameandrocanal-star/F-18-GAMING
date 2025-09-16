# F-18 Super Hornet Flight Simulator

Um simulador de voo realista do caça F-18 Super Hornet desenvolvido em HTML5 Canvas e JavaScript.

## Características

### Física de Voo Realista
- Cálculos baseados nas especificações reais do F-18 Super Hornet
- Empuxo dos motores F414-GE-400 (44.000 lbs total)
- Peso e dimensões precisas
- Efeitos de altitude na densidade do ar
- Sustentação e arrasto aerodinâmicos
- Efeitos de compressibilidade em alta velocidade
- Stall em baixa velocidade

### Controles
- **W/S**: Controle de pitch (subir/descer)
- **A/D**: Controle de yaw (virar esquerda/direita)
- **Q/E**: Controle de roll (inclinar lateralmente)
- **Shift**: Acelerar (aumentar throttle)
- **Ctrl**: Frear (diminuir throttle)
- **Espaço**: Afterburner (só funciona com throttle alto)

### Ambiente Visual
- Terreno realista com textura de satélite
- Sistema de nuvens em 3D com diferentes altitudes
- Nuvens de tempestade
- Efeito parallax baseado na altitude
- Horizonte dinâmico com efeito de roll
- Gradiente de céu que muda com a altitude

### HUD (Head-Up Display)
- Altitude em pés
- Velocidade em nós
- Direção em graus
- Nível de combustível

### Características do F-18 Super Hornet
- Sprite detalhado do F-18 Super Hornet
- Efeitos visuais de afterburner
- Rastro de vapor em alta velocidade
- Consumo realista de combustível
- Limitações de performance baseadas no combustível

## Especificações Técnicas

### Dados do F-18 Super Hornet
- Peso vazio: 32.100 lbs
- Peso máximo: 66.000 lbs
- Velocidade máxima: Mach 1.8+ (~1200 kt)
- Teto de serviço: 50.000+ pés
- Motores: 2x F414-GE-400 (22.000 lbs cada)

### Tecnologias Utilizadas
- HTML5 Canvas para renderização
- JavaScript ES6+ para lógica do jogo
- Texturas geradas por IA para ambiente
- Física de voo baseada em princípios aerodinâmicos reais

## Como Jogar

1. Abra o arquivo `index.html` em um navegador web
2. Aguarde o carregamento dos assets
3. Use os controles do teclado para voar
4. Monitore o HUD para informações de voo
5. Gerencie o combustível para voos longos

## Dicas de Voo

- Mantenha velocidade acima de 120 kt para evitar stall
- Use afterburner apenas quando necessário (consome muito combustível)
- Em alta altitude, os controles ficam menos responsivos
- Coordene curvas usando roll e yaw juntos
- Observe o terreno em baixa altitude para navegação

## Recursos Futuros

- Sistema de missões
- Múltiplos aeroportos
- Condições meteorológicas variáveis
- Multiplayer
- Mais aeronaves

