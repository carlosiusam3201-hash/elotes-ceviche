const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Manejar preflight OPTIONS request
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
    
    // Leer archivo de clientes
    let clients = [];
    if (fs.existsSync(dataPath)) {
      clients = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    const newClient = JSON.parse(event.body);
    
    // Verificar si el cliente ya existe
    const existingClient = clients.find(client => 
      client.phone === newClient.phone || client.email === newClient.email
    );
    
    if (existingClient) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ 
          error: 'Cliente ya existe',
          client: existingClient
        })
      };
    }
    
    // Crear nuevo cliente
    const clientId = 'CLI_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const clientData = {
      id: clientId,
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email,
      points: 0,
      totalSpent: 0,
      registrationDate: new Date().toISOString()
    };
    
    clients.push(clientData);
    
    // Guardar en el archivo
    fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
    
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