const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();  // Para carregar as variáveis de ambiente do arquivo .env

const app = express();
const port = 80;

// Configurar a conexão com o banco de dados PostgreSQL
const pool = new Pool({
  host: 'db',  // O nome do serviço no docker-compose.yml
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  port: 5432,  // Porta padrão do PostgreSQL
});

// Função de tentativa de conexão ao banco de dados
const tryConnectDB = async () => {
  let retries = 5;  // Número de tentativas
  let connected = false;

  while (retries > 0 && !connected) {
    try {
      // Tentando realizar uma consulta simples no banco para testar a conexão
      await pool.query('SELECT NOW()');  // Retorna a data e hora atual do banco
      connected = true;
      console.log('Conectado ao banco de dados');
    } catch (err) {
      retries -= 1;
      console.error('Erro ao conectar ao PostgreSQL', err.stack);
      if (retries > 0) {
        console.log(`Tentando novamente... (${retries} tentativas restantes)`);
        await new Promise(res => setTimeout(res, 5000));  // Espera 5 segundos antes de tentar novamente
      } else {
        console.log('Falha ao conectar ao banco de dados após várias tentativas.');
      }
    }
  }

  if (!connected) {
    process.exit(1);  // Sai do processo com erro
  }
};

// Iniciar tentativa de conexão ao banco de dados
tryConnectDB();

// Rota principal
app.get('/', async (req, res) => {
  try {
    // Consultando o banco de dados para testar a conexão
    const result = await pool.query('SELECT NOW()');  // Retorna a data e hora atual do banco
    res.send(`POC Environment is up! Database Time: ${result.rows[0].now}`);
  } catch (err) {
    console.error('Erro ao conectar ao PostgreSQL', err.stack);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

// Iniciar o servidor
app.listen(port, () => console.log(`App rodando na Porta ${port}`));
