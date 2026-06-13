import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const DB_FILE = path.join(__dirname, 'orders.json');

// Initialize Database if doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
  console.log('[Database] Initialized empty orders.json');
}

// Helper to read/write DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('[Error] Failed to read database:', err);
    return [];
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[Error] Failed to write to database:', err);
  }
};

// --- API ENDPOINTS ---

// Fetch all active orders
app.get('/api/orders', (req, res) => {
  const orders = readDB();
  console.log('[Database Response] Fetched all orders.');
  res.json(orders);
});

// Create new order
app.post('/api/orders', (req, res) => {
  console.log('[Order Created] Received new order request');
  const newOrder = req.body;
  
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const orders = readDB();
  orders.push(newOrder);
  writeDB(orders);

  console.log(`[Order Saved] Order ${newOrder.id} saved to database.`);

  // Emit real-time event
  io.emit('new_order', newOrder);
  console.log(`[Realtime Events] Emitted new_order for ${newOrder.id}`);

  res.status(201).json({ message: 'Order created successfully', order: newOrder });
});

// Update an order (e.g. status change)
app.put('/api/orders/:id', (req, res) => {
  const orderId = req.params.id;
  const updates = req.body;
  
  const orders = readDB();
  const orderIndex = orders.findIndex(o => o.id === orderId);

  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[orderIndex] = { ...orders[orderIndex], ...updates };
  writeDB(orders);

  console.log(`[Database Response] Order ${orderId} updated.`);

  // Emit real-time event
  io.emit('order_updated', orders[orderIndex]);
  console.log(`[Realtime Events] Emitted order_updated for ${orderId}`);

  res.json({ message: 'Order updated successfully', order: orders[orderIndex] });
});

// Sync completely (if client sends full orders list, though discouraged, keep for compatibility if needed)
app.post('/api/orders/sync', (req, res) => {
  const updatedOrders = req.body;
  writeDB(updatedOrders);
  console.log('[Database Response] Database forcefully synchronized with provided orders array.');
  io.emit('orders_synced', updatedOrders);
  res.json({ message: 'Synced successfully' });
});


// --- SOCKET.IO HANDLING ---
io.on('connection', (socket) => {
  console.log(`[Realtime Events] Client connected: ${socket.id}`);
  
  // Kitchen Fetch Response simulator
  socket.on('request_orders', () => {
    const orders = readDB();
    console.log(`[Kitchen Fetch Response] Sending orders to ${socket.id}`);
    socket.emit('initial_orders', orders);
  });

  socket.on('disconnect', () => {
    console.log(`[Realtime Events] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] Backend running on port ${PORT}`);
});
