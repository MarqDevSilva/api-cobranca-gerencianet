const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'admin',
    password: 'P@$$%0rd',
    database: 'api_spring'
};

const connection = mysql.createConnection(dbConfig);

async function updateStatus(data) {
  try {
    if (data && data.length > 0) {
        const ultimoStatus = data[data.length - 1];
        const status = ultimoStatus.status;
        const chargeId = ultimoStatus.identifiers.charge_id;
        const statusAtual = status.current;
        const connection = await mysql.createConnection(dbConfig);
        await submitQuery(connection, chargeId, statusAtual)
        await connection.end();
      }
  } catch (error) {
    console.error('Erro ao atualizar as informações no banco de dados:', error);
    throw error;
  }
}

async function submitQuery(connection, chargeId, status) {
    try {
        const [results] = await connection.execute(`SELECT id FROM inscricao WHERE transacao_id = ? LIMIT 1;`, [chargeId]);

        if (results.length > 0) {
            const id = results[0].id;
            await connection.execute(`UPDATE inscricao SET status = ? WHERE id = ?;`, [status, id]);
        } else {
            throw new Error("Nenhum ID encontrado para o chargeId especificado.");
        }
    } catch (error) {
        console.error('Erro ao executar a consulta:', error);
        throw error;
    }
}

module.exports = { updateStatus };