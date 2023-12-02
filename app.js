const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Configuração do banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'escribo'
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado ao MySQL');
});

// Rota de cadastro
app.post('/signup', async (req, res) => {
  try {
    const { nome, email, senha, telefones } = req.body;

    // Verificar se o e-mail já está em uso
    const checkEmailQuery = 'SELECT * FROM usuarios WHERE email = ?';
    const existingUser = await queryAsync(checkEmailQuery, [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'E-mail já em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Inserir usuário no banco de dados
    const insertUserQuery = 'INSERT INTO usuarios (nome, email, senha, telefones) VALUES (?, ?, ?, ?)';
    await queryAsync(insertUserQuery, [nome, email, hashedPassword, JSON.stringify(telefones)]);

    return res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para realizar consultas no banco de dados de forma assíncrona
const queryAsync = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
