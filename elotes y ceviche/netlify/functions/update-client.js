const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método no permitido' })
    };
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'clients.json');
    
    let clients = [];
    if (fs.existsSync(dataPath)) {
      clients = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    const { clientId, updates } = JSON.parse(event.body);
    
    const clientIndex = clients.findIndex(client => client.id === clientId);
    
    if (clientIndex === -1) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Cliente no encontrado' })
      };
    }
    
    // Actualizar cliente
    clients[clientIndex] = { ...clients[clientIndex], ...updates };
    
    // Guardar cambios
    fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        client: clients[clientIndex] 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};