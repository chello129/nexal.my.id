const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

const orders = new Map();

const gameNames = {
  ml: 'Mobile Legends',
  ff: 'Free Fire',
  pubg: 'PUBG Mobile',
  valorant: 'Valorant',
  steam: 'Steam Wallet',
};

const packagePrices = {
  'Diamond 50': 'Rp 19.000',
  'Diamond 150': 'Rp 49.000',
  'UC 140': 'Rp 25.000',
  'Voucher Steam': 'Rp 100.000',
  'Pulsa Game': 'Rp 35.000',
};

function getOrderTotal(pkg) {
  return packagePrices[pkg] || 'Rp 0';
}

function createOrder(data) {
  const id = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
  const order = {
    id,
    status: 'Menunggu Pembayaran',
    game: gameNames[data.game] || data.game,
    playerId: data.playerId,
    server: data.server,
    package: data.package,
    total: getOrderTotal(data.package),
    createdAt: new Date().toISOString(),
    paymentConfirmed: false,
    topupDelivered: false,
    note: 'Silakan selesaikan pembayaran lalu konfirmasi ke CS.',
  };

  orders.set(id, order);
  return order;
}

app.post('/api/order', (req, res) => {
  const { game, playerId, server, package: pkg } = req.body;

  if (!game || !playerId || !server || !pkg) {
    return res.status(400).json({ error: 'Game, Player ID, Server, dan Paket harus diisi.' });
  }

  const order = createOrder({ game, playerId, server, package: pkg, total: 'Rp 319.000' });
  return res.status(201).json({ order, message: 'Pesanan berhasil dibuat. Silakan lakukan pembayaran.' });
});

app.get('/api/order/:id', (req, res) => {
  const order = orders.get(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
  }
  return res.json(order);
});

app.post('/api/payment/confirm', (req, res) => {
  const { orderId, method, amount } = req.body;
  const order = orders.get(orderId);

  if (!order) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
  }

  order.status = 'Pembayaran Terkonfirmasi';
  order.paymentConfirmed = true;
  order.note = 'Pembayaran diverifikasi. Proses top up akan segera dikirim.';
  order.topupDelivered = true;
  order.deliveryAt = new Date().toISOString();
  order.paymentMethod = method || 'Transfer / E-Wallet';
  order.amountPaid = amount || order.total;

  return res.json({ order, message: 'Pembayaran berhasil dikonfirmasi.' });
});

app.get('/api/games', (req, res) => {
  return res.json([
    { name: 'Mobile Legends', tag: 'Diskon 16%' },
    { name: 'Free Fire', tag: 'Flash Sale' },
    { name: 'PUBG Mobile', tag: 'Promo UC' },
    { name: 'Valorant', tag: 'Voucher' },
    { name: 'Steam Wallet', tag: 'IDR' },
    { name: 'Garena Shells', tag: 'Cepat' },
  ]);
});

app.listen(PORT, () => {
  console.log(`NEXAL server berjalan di http://localhost:${PORT}`);
});
