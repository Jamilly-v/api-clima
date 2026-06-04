# API de Consulta de Clima e Cidades

## Descrição

API REST desenvolvida em Node.js para consulta de cidades por estado e consulta de clima por cidade.

## Tecnologias Utilizadas

* Node.js
* Express
* Axios
* Cors
* Jest

## Instalação

```bash
npm install
```

## Execução

```bash
node src/server.js
```

## Endpoints

### Health Check

GET /api/v1/health

### Cidades por Estado

GET /api/v1/cidades/{UF}

Exemplo:

GET /api/v1/cidades/CE

### Clima por Cidade

GET /api/v1/clima/{cidade}

Exemplo:

GET /api/v1/clima/Fortaleza

## Testes

```bash
npm test
```
