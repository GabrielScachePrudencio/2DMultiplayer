# 2D Multiplayer

Jogo multiplayer 2D em desenvolvimento, com salas em tempo real, seleção de classe e um mapa com temática de castelo. O projeto é dividido em um cliente web e um servidor Java que controla as salas, a movimentação e o estado compartilhado do jogo.

## Imagens

Adicione suas capturas de tela em `docs/images/` e, se quiser, descomente e ajuste as linhas abaixo.

<!-- ![Tela de salas](docs/images/tela-salas.png) -->
<!-- ![Seleção de classe](docs/images/selecao-classe.png) -->
<!-- ![Partida no castelo](docs/images/partida-castelo.png) -->

## Funcionalidades atuais

- Criar e entrar em salas multiplayer.
- Escolher a capacidade de cada sala entre 2 e 8 jogadores.
- Ver a quantidade de jogadores conectados e a capacidade da sala.
- Escolher uma classe antes de entrar no jogo.
- Mover o personagem com as teclas `W`, `A`, `S` e `D`.
- Acompanhar os jogadores em tempo real por WebSocket.
- Jogar em um mapa de castelo com câmera que acompanha os jogadores e colisão validada no servidor.
- Mirar com o mouse: uma seta mostra a direção e o personagem é espelhado horizontalmente ao mirar para o lado oposto.
- Encontrar um Goblin de treino em cada sala. Ele é estático e ainda não recebe dano nem ataca.

## Tecnologias

| Parte | Tecnologias |
|---|---|
| Front-end | React, JavaScript, HTML Canvas e WebSocket |
| Back-end | Java 21, Spring Boot, Spring WebSocket e Spring Data JPA |
| Banco de dados | MySQL |

## Estrutura do repositório

```text
2DMultiplayer/
├── 2dMultiplayer-front/    # Aplicação React
└── 2dMultiplayer/          # API e servidor WebSocket Spring Boot
```

### Front-end

O mapa, a leitura do teclado e o desenho no Canvas ficam em `2dMultiplayer-front/src/game/`. A interface das salas fica em `2dMultiplayer-front/src/component/` e `2dMultiplayer-front/src/pages/`.

### Back-end

O servidor recebe os inputs, atualiza as posições, verifica colisões e envia o estado das salas. As salas e classes são acessadas pela API REST; movimento e estado de jogo usam WebSocket.

## Requisitos

- Java 21
- Node.js e npm
- MySQL

## Configuração do banco de dados

O back-end está configurado para conectar a:

```text
localhost:3307/db2dmultiplayer
```

Confira `2dMultiplayer/src/main/resources/application.properties` e ajuste a URL, o usuário e a senha para os valores da sua instalação local. O nome do banco pode ser criado automaticamente pela configuração atual, desde que o usuário MySQL tenha permissão para isso.

Não publique credenciais reais no repositório. Para executar em outro ambiente, configure credenciais próprias e mantenha-as fora dos arquivos versionados.

## Como executar localmente

### 1. Inicie o MySQL

Confirme que o serviço está ativo e acessível na porta definida em `application.properties` (por padrão, `3307`).

### 2. Inicie o back-end

No Windows, abra um terminal na pasta `2dMultiplayer` e execute:

```powershell
.\gradlew.bat bootRun
```

O servidor Spring Boot inicia, por padrão, em `http://localhost:8080`.

### 3. Inicie o front-end

Em outro terminal, abra `2dMultiplayer-front` e execute:

```powershell
npm install
npm start
```

A aplicação React abre em `http://localhost:3000`. Em modo de desenvolvimento, o cliente usa o back-end em `localhost:8080`.

## Controles

| Ação | Controle |
|---|---|
| Mover | `W`, `A`, `S`, `D` |
| Mirar | Mover o mouse sobre a área do jogo |

## Endpoints principais

| Método | Caminho | Uso |
|---|---|---|
| `GET` | `/salas` | Listar salas |
| `POST` | `/salas` | Criar sala; recebe `{"capacidade": 4}` (permitido de 2 a 8) |

O WebSocket do jogo fica em `/ws`; o WebSocket do lobby fica em `/lobby-ws`.

## Testes e build

Para executar os testes do back-end:

```powershell
cd 2dMultiplayer
.\gradlew.bat test
```

Para gerar o build do front-end:

```powershell
cd 2dMultiplayer-front
npm run build
```

