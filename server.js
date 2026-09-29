// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * 1. CREATE - POST /api/inscricoes
 * Criar uma nova inscrição
 */
app.post('/api/inscricoes', async (req, res) => {

        const { nome, cpf, email, curso, data_nascimento } = req.body;

        const query = `
            INSERT INTO inscricoes (nome, cpf, email, curso, data_nascimento)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [nome, cpf, email, curso, data_nascimento || null]);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Inscrição realizada com sucesso!',
            id: result.insertId
        });
  
});

/**
 * 2. READ ALL - GET /api/inscricoes
 * Listar todas as inscrições registradas
 */
app.get('/api/inscricoes', async (req, res) => {
    
    const query = `
        SELECT 
            id,
            nome,
            cpf,
            email,
            curso,
            DATE_FORMAT(data_nascimento, '%d/%m/%Y') AS data_nascimento,
            DATE_FORMAT(data_inscricao, '%d/%m/%Y %H:%i') AS data_inscricao
        FROM inscricoes
        ORDER BY id DESC
    `;

    const [rows] = await db.query(query);

    return res.status(200).json({
        sucesso: true,
        total: rows.length,
        dados: rows
    });
 
});

/**
 * 3. READ ONE - GET /api/inscricoes/:id
 * Buscar uma inscrição específica pelo ID
 */
app.get('/api/inscricoes/:id', async (req, res) => {
  
        const { id } = req.params;

        const query = `
            SELECT 
                id,
                nome,
                cpf,
                email,
                curso,
                DATE_FORMAT(data_nascimento, '%d/%m/%Y') AS data_nascimento,
                DATE_FORMAT(data_inscricao, '%d/%m/%Y %H:%i') AS data_inscricao
            FROM inscricoes
            WHERE id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Inscrição não encontrada.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            dados: rows[0]
        });
    
});

/**
 * 4. UPDATE - PUT /api/inscricoes/:id
 * Atualizar os dados de uma inscrição
 */
app.put('/api/inscricoes/:id', async (req, res) => {
    
        const { id } = req.params;
        const { nome, cpf, email, curso, data_nascimento } = req.body;

        const query = `
            UPDATE inscricoes
            SET nome = ?, cpf = ?, email = ?, curso = ?, data_nascimento = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [nome, cpf, email, curso, data_nascimento, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Inscrição não encontrada para atualização.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Inscrição atualizada com sucesso!'
        });
  
});

/**
 * 5. DELETE - DELETE /api/inscricoes/:id
 * Cancelar/Deletar uma inscrição
 */
app.delete('/api/inscricoes/:id', async (req, res) => {
  
        const { id } = req.params;

        const query = `DELETE FROM inscricoes WHERE id = ?`;

        const [result] = await db.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Inscrição não encontrada para remoção.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Inscrição cancelada com sucesso!'
        });
  
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🎓 Endpoints de inscrição ativos em: http://localhost:${PORT}/api/inscricoes`);
});