const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

/*
--------------------------------
HEALTH CHECK
--------------------------------
*/
app.get("/api/v1/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        versao: "1.0.0",
        timestamp: new Date().toISOString()
    });
});

/*
--------------------------------
CIDADES POR ESTADO
--------------------------------
*/
app.get("/api/v1/cidades/:uf", async (req, res) => {

    const uf = req.params.uf.toUpperCase();

    // Validação
    if (uf.length !== 2) {
        return res.status(400).json({
            erro: true,
            codigo: "SIGLA_UF_INVALIDA",
            mensagem: "A sigla do estado deve conter exatamente 2 letras",
            sigla_uf_informada: req.params.uf
        });
    }

    try {

        const resposta = await axios.get(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
        );

        const cidades = resposta.data.map(cidade => ({
            nome: cidade.nome
        }));
        
        console.log("UF:", uf);
        console.log("Quantidade:", cidades.length);

        if (cidades.length === 0) {
    return res.status(404).json({
        erro: true,
        codigo: "UF_NAO_ENCONTRADA",
        mensagem: "Estado com a sigla informada não foi encontrado",
        sigla_uf_informada: uf
    });
}
        res.status(200).json({
            uf,
            quantidade_retornada: cidades.length,
            cidades,
            consultado_em: new Date().toISOString()
        });

    } catch (erro) {

        res.status(404).json({
            erro: true,
            codigo: "UF_NAO_ENCONTRADA",
            mensagem: "Estado com a sigla informada não foi encontrado",
            sigla_uf_informada: uf
        });

    }

});

/*
--------------------------------
CLIMA POR CIDADE
--------------------------------
*/
app.get("/api/v1/clima/:cidade", async (req, res) => {

    const cidade = req.params.cidade;

    if (cidade.length < 2) {
        return res.status(400).json({
            erro: true,
            codigo: "NOME_INVALIDO",
            mensagem: "O nome da cidade deve conter pelo menos 2 caracteres",
            nome_informado: cidade
        });
    }

    try {

        // Busca cidade
        const geoResponse = await axios.get(
            `https://geocoding-api.open-meteo.com/v1/search?name=${cidade}&count=1&language=pt&format=json`
        );

        if (
            !geoResponse.data.results ||
            geoResponse.data.results.length === 0
        ) {
            return res.status(404).json({
                erro: true,
                codigo: "CIDADE_NAO_ENCONTRADA",
                mensagem: "Nenhuma cidade encontrada com o nome informado",
                nome_informado: cidade
            });
        }

        const cidadeEncontrada = geoResponse.data.results[0];

        const latitude = cidadeEncontrada.latitude;
        const longitude = cidadeEncontrada.longitude;

        // Busca clima
        const climaResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`
        );

        res.status(200).json({
            nome: cidadeEncontrada.name,
            estado: cidadeEncontrada.admin1,
            clima: {
                temperatura: climaResponse.data.current.temperature_2m,
                unidade: "°C"
            },
            consultado_em: new Date().toISOString()
        });

    } catch (erro) {

        console.error(erro.message);

        res.status(503).json({
            erro: true,
            codigo: "SERVICO_EXTERNO_INDISPONIVEL",
            mensagem: "Não foi possível obter dados do serviço externo. Tente novamente em alguns instantes"
        });

    }

});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});