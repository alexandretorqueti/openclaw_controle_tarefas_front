import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = createServer((req, res) => {
  console.log(`Request: ${req.url}`);
  
  try {
    // Decodificar a URL para verificar se há problemas
    const decodedUrl = decodeURI(req.url);
    console.log(`Decoded URL: ${decodedUrl}`);
    
    // Remover query parameters
    const pathname = decodedUrl.split('?')[0];
    
    // Determinar o caminho do arquivo
    let filePath;
    if (pathname === '/') {
      filePath = join(__dirname, 'dist', 'index.html');
    } else {
      filePath = join(__dirname, 'dist', pathname);
    }
    
    // Verificar se o arquivo existe
    if (!existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    
    // Ler o arquivo
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
    
  } catch (error) {
    console.error(`Error processing ${req.url}:`, error.message);
    res.writeHead(400);
    res.end('Bad request');
  }
});

server.listen(3001, () => {
  console.log('Test server running on http://localhost:3001');
  console.log('Serving files from dist/ directory');
});