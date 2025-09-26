import net from 'node:net';

const [,, hostArg, startArg, endArg] = process.argv;
const host = hostArg ?? '127.0.0.1';
const startPort = Number(startArg ?? 1);
const endPort = Number(endArg ?? 1024);

if (!Number.isInteger(startPort) || !Number.isInteger(endPort) || startPort < 1 || endPort > 65535 || startPort > endPort) {
  console.error('Uso: node api/port-scan.js [host] [porta_inicial] [porta_final]');
  process.exit(1);
}

let found = false;

function checkPort(port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, host);

    const close = () => {
      socket.destroy();
      resolve();
    };

    socket.on('connect', () => {
      found = true;
      console.log(`Porta ${port} aberta em ${host}`);
      close();
    });

    socket.on('error', close);
    socket.setTimeout(1000, close);
  });
}

async function scan() {
  for (let port = startPort; port <= endPort; port += 1) {
    await checkPort(port);
  }

  if (!found) {
    console.log(`Nenhuma porta aberta encontrada em ${host} entre ${startPort} e ${endPort}.`);
  }
}

scan().catch((error) => {
  console.error('Erro durante a varredura de portas:', error);
  process.exit(1);
});
