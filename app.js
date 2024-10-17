const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para buscar CNPJ baseado no telefone
app.get('/api/telefone/:telefone', async (req, res) => {
    const telefone = req.params.telefone;

    try {
        // Fazer a requisição para a API que busca o CNPJ pelo telefone
        const response = await fetch(`https://api-telefone-cnpj.onrender.com/cnpj/${telefone}`);
        const data = await response.json();

        // Verifica se a resposta é um erro
        if (response.status !== 200) {
            return res.status(response.status).json(data);
        }

        const cnpj = data.cnpj; // Supondo que a resposta contenha o campo 'cnpj'

        // Fazer a requisição para a ReceitaWS usando o CNPJ obtido
        const receitaResponse = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
        const receitaData = await receitaResponse.json();

        if (receitaData.status === 'ERROR') {
            return res.status(400).json(receitaData);
        }

        res.json(receitaData);
    } catch (error) {
        res.status(500).send('Erro ao buscar dados');
    }
});

// Rota para buscar CNPJ diretamente (caso você precise dela)
app.get('/api/cnpj/:cnpj', async (req, res) => {
    const cnpj = req.params.cnpj;
    try {
        const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`);
        const data = await response.json();
        
        if (data.status === 'ERROR') {
            return res.status(400).json(data);
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).send('Erro ao buscar dados');
    }
});

app.listen(port, () => {
    console.log(`Servidor agora rodando em http://localhost:${port}`);
});
