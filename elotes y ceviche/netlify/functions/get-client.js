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
    
    const { clientId, phone } = JSON.parse(event.body);
    
    let clientData;
    
    if (clientId) {
      clientData = clients.find(client => client.id === clientId);
    } else if (phone) {
      clientData = clients.find(client => client.phone === phone);
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Se requiere clientId o phone' })
      };
    }
    
    if (!clientData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Cliente no encontrado' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        client: clientData 
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