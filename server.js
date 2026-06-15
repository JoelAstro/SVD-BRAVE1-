import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import mongoose from 'mongoose';
import { Notification, ActivityLog, KitchenHistory } from './models/mongo.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json());

const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

// --- PRISMA (PostgreSQL) INIT ---
const prisma = new PrismaClient();

// --- Seed Menu Items to PostgreSQL if empty ---
const seedMenuIfEmpty = async () => {
  try {
    const count = await prisma.menuItem.count();
    if (count === 0) {
      console.log('[Database] MenuItem table is empty. Seeding from menu.json...');
      const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menu.json'), 'utf8'));
      const allItems = [...menuData.dineIn, ...menuData.takeaway];
      for (const item of allItems) {
        await prisma.menuItem.create({
          data: {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            type: item.type,
            image: item.image,
            description: item.description
          }
        });
      }
      console.log(`[Database] Seeded ${allItems.length} menu items successfully.`);
    }
  } catch (err) {
    console.warn('[Database] Seeding skipped (PostgreSQL might be offline):', err.message);
  }
};
seedMenuIfEmpty();

// --- MONGOOSE (MongoDB) INIT ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/svd_db')
  .then(() => console.log('[MongoDB] Connected successfully'))
  .catch(err => console.error('[MongoDB] Connection error:', err));


// --- API ENDPOINTS (PostgreSQL) ---

// Fetch all active orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
    });
    // Convert to frontend expected format
    const formattedOrders = orders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        id: i.menuItemId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        isAdditional: i.isAdditional,
        addedAt: i.addedAt,
      }))
    }));
    res.json(formattedOrders);
  } catch (err) {
    console.error('[Error] GET /api/orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  console.log('[Order Created] Received new order request');
  const newOrder = req.body;
  
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // Instantly broadcast to all tabs first to guarantee real-time UI sync
  io.emit('new-order', newOrder); 

  try {
    const createdOrder = await prisma.order.create({
      data: {
        id: newOrder.id,
        tableNo: newOrder.tableNo,
        customerName: newOrder.customerName || '',
        customerPhone: newOrder.customerPhone || '',
        status: newOrder.status,
        timestamp: newOrder.timestamp,
        isParcel: newOrder.isParcel || false,
        specialNotes: newOrder.specialNotes,
        pickupTime: newOrder.pickupTime,
        items: {
          create: newOrder.items.map(i => ({
            menuItemId: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            isAdditional: i.isAdditional || false,
            addedAt: i.addedAt,
          }))
        }
      },
      include: { items: true }
    });

    console.log(`[Order Saved] Order ${createdOrder.id} saved to PostgreSQL.`);

    // Log to MongoDB if online
    if (mongoose.connection.readyState === 1) {
      ActivityLog.create({
        id: 'ACT-' + Date.now(),
        action: 'ORDER_CREATED',
        details: { orderId: createdOrder.id, tableNo: createdOrder.tableNo }
      }).catch(err => console.warn('[MongoDB] Failed to log activity:', err.message));
    } else {
      console.log('[MongoDB] Offline, skipping activity log.');
    }

    res.status(201).json({ message: 'Order created', order: newOrder });

  } catch (err) {
    console.error('[Error] POST /api/orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order (e.g. status change, adding items)
app.put('/api/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const updates = req.body;
  
  // Instantly broadcast for real-time UI
  io.emit('order_updated', updates);

  try {
    // Determine if we are updating items or just status
    if (updates.items) {
      // Clear existing items and recreate
      await prisma.orderItem.deleteMany({ where: { orderId } });
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: updates.status,
          timestamp: updates.timestamp,
          specialNotes: updates.specialNotes,
          items: {
            create: updates.items.map(i => ({
              menuItemId: i.id,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              isAdditional: i.isAdditional || false,
              addedAt: i.addedAt,
            }))
          }
        }
      });
    } else {
      // Just updating fields like status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: updates.status, timestamp: updates.timestamp }
      });
    }

    console.log(`[Database Response] Order ${orderId} updated in PostgreSQL.`);

    // Log to MongoDB history if status changed
    if (updates.status) {
      // Log to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        KitchenHistory.create({ orderId, status: updates.status })
          .catch(err => console.warn('[MongoDB] Failed to log kitchen history:', err.message));
      }

      // If PAID, handle notification
      if (updates.status === 'PAID') {
        const notifId = 'NTF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const notificationData = {
          id: notifId,
          orderId: orderId,
          tableNo: updates.tableNo || 'N/A',
          customerName: updates.customerName || 'Customer',
          amount: updates.amount || 0,
          timestamp: Date.now()
        };

        // Persist to MongoDB if online
        if (mongoose.connection.readyState === 1) {
          Notification.create(notificationData)
            .catch(err => console.warn('[MongoDB] Failed to log notification:', err.message));
        }

        // Always broadcast to active clients in real-time
        console.log(`[Realtime Events] Emitted new_notification for ${orderId}`);
        io.emit('new_notification', notificationData);
      }
    }

    res.json({ message: 'Order updated', order: updates });

  } catch (err) {
    console.error('[Error] PUT /api/orders/:id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync (For Bulk updates / existing logic compatibility)
app.post('/api/orders/sync', async (req, res) => {
  // If the frontend tries to sync completely, we just broadcast to keep devices in sync
  io.emit('orders_synced', req.body);
  res.json({ message: 'Sync broadcasted' });
});

// Fetch all menu items (with fallback to local JSON file)
app.get('/api/menu', async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany();
    if (items.length > 0) {
      const dineIn = items.filter(i => !['Couple Pack', 'Family Pack', 'Bucket Biryani'].includes(i.category));
      const takeaway = items.filter(i => ['Couple Pack', 'Family Pack', 'Bucket Biryani'].includes(i.category));
      return res.json({ dineIn, takeaway });
    }
  } catch (err) {
    console.warn('[Database] Failed to fetch menu from PostgreSQL, falling back to menu.json:', err.message);
  }
  
  try {
    const menuData = JSON.parse(fs.readFileSync(path.join(__dirname, 'menu.json'), 'utf8'));
    res.json(menuData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read menu data' });
  }
});

// Update menu item image (with DB write and JSON file backup + Socket.io live broadcast)
app.put('/api/menu/:id/image', async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;
  
  if (!image) {
    return res.status(400).json({ error: 'Image URL is required' });
  }

  const itemId = parseInt(id);

  // 1. Broadcast the update in real-time instantly via Socket.io
  console.log(`[Realtime Events] Emitting menu_item_image_updated for ID ${itemId} -> ${image}`);
  io.emit('menu_item_image_updated', { id: itemId, image });

  // 2. Try updating PostgreSQL via Prisma
  let dbSuccess = false;
  try {
    await prisma.menuItem.update({
      where: { id: itemId },
      data: { image }
    });
    console.log(`[Database] Updated menu item ${itemId} image in PostgreSQL.`);
    dbSuccess = true;
  } catch (err) {
    console.warn(`[Database] Failed to update PostgreSQL for item ${itemId} (using file fallback):`, err.message);
  }

  // 3. Always update the local menu.json file as a backup
  try {
    const menuPath = path.join(__dirname, 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    let updated = false;
    menuData.dineIn = menuData.dineIn.map(item => {
      if (item.id === itemId) {
        updated = true;
        return { ...item, image };
      }
      return item;
    });
    
    if (!updated) {
      menuData.takeaway = menuData.takeaway.map(item => {
        if (item.id === itemId) {
          updated = true;
          return { ...item, image };
        }
        return item;
      });
    }

    if (updated) {
      fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2), 'utf8');
      console.log(`[File System] Updated menu item ${itemId} image in menu.json.`);
    }
  } catch (err) {
    console.error('[File System] Failed to update menu.json:', err);
  }

  res.json({ success: true, message: 'Image updated successfully', dbSync: dbSuccess });
});

// Update entire menu item (with DB write, JSON backup and Socket.io live broadcast)
app.put('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const itemId = parseInt(id);
  const updateData = req.body;

  // 1. Broadcast the update in real-time instantly via Socket.io to all clients
  console.log(`[Realtime Events] Emitting menu_item_updated for ID ${itemId}:`, updateData);
  io.emit('menu_item_updated', { id: itemId, ...updateData });

  // 2. Try updating/creating PostgreSQL via Prisma
  let dbSuccess = false;
  try {
    const prismaData = {
      name: updateData.name || '',
      price: parseFloat(updateData.price || 0),
      category: updateData.category || '',
      type: updateData.type || 'veg',
      image: updateData.image || '',
      description: updateData.description || ''
    };

    const existing = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (existing) {
      await prisma.menuItem.update({
        where: { id: itemId },
        data: prismaData
      });
      console.log(`[Database] Updated menu item ${itemId} in PostgreSQL.`);
    } else {
      await prisma.menuItem.create({
        data: {
          id: itemId,
          ...prismaData
        }
      });
      console.log(`[Database] Created new menu item ${itemId} in PostgreSQL.`);
    }
    dbSuccess = true;
  } catch (err) {
    console.warn(`[Database] Failed to upsert PostgreSQL for item ${itemId} (using file fallback):`, err.message);
  }

  // 3. Update the local menu.json file
  try {
    const menuPath = path.join(__dirname, 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    let updated = false;
    menuData.dineIn = menuData.dineIn.map(item => {
      if (item.id === itemId) {
        updated = true;
        return { ...item, ...updateData };
      }
      return item;
    });
    
    if (!updated) {
      menuData.takeaway = menuData.takeaway.map(item => {
        if (item.id === itemId) {
          updated = true;
          return { ...item, ...updateData };
        }
        return item;
      });
    }

    if (!updated) {
      // It's a new item! Appending to correct array
      const newItem = { id: itemId, ...updateData };
      if (['Couple Pack', 'Family Pack', 'Bucket Biryani'].includes(updateData.category)) {
        menuData.takeaway.push(newItem);
      } else {
        menuData.dineIn.push(newItem);
      }
      updated = true;
      console.log(`[File System] Appended new menu item ${itemId} to menu.json.`);
    }

    if (updated) {
      fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2), 'utf8');
      console.log(`[File System] Saved updated menu in menu.json.`);
    }
  } catch (err) {
    console.error('[File System] Failed to update menu.json:', err);
  }

  res.json({ success: true, message: 'Menu item updated/upserted successfully', dbSync: dbSuccess });
});

// Delete menu item (with DB write, JSON backup and Socket.io live broadcast)
app.delete('/api/menu/:id', async (req, res) => {
  const { id } = req.params;
  const itemId = parseInt(id);

  // 1. Broadcast the deletion in real-time instantly via Socket.io to all clients
  console.log(`[Realtime Events] Emitting menu_item_deleted for ID ${itemId}`);
  io.emit('menu_item_deleted', { id: itemId });

  let dbSuccess = false;
  // 2. Try deleting from PostgreSQL via Prisma
  try {
    await prisma.menuItem.delete({
      where: { id: itemId }
    });
    console.log(`[Database] Deleted menu item ${itemId} from PostgreSQL.`);
    dbSuccess = true;
  } catch (err) {
    console.warn(`[Database] Failed to delete from PostgreSQL for item ${itemId} (using file fallback):`, err.message);
  }

  // 3. Update local menu.json file
  try {
    const menuPath = path.join(__dirname, 'menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    
    const originalLengthDineIn = menuData.dineIn.length;
    menuData.dineIn = menuData.dineIn.filter(item => item.id !== itemId);
    
    let deleted = menuData.dineIn.length < originalLengthDineIn;
    if (!deleted) {
      const originalLengthTakeaway = menuData.takeaway.length;
      menuData.takeaway = menuData.takeaway.filter(item => item.id !== itemId);
      deleted = menuData.takeaway.length < originalLengthTakeaway;
    }

    if (deleted) {
      fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2), 'utf8');
      console.log(`[File System] Deleted menu item ${itemId} in menu.json.`);
    }
  } catch (err) {
    console.error('[File System] Failed to update menu.json on delete:', err);
  }

  res.json({ success: true, message: 'Menu item deleted successfully', dbSync: dbSuccess });
});


// --- SERVE STATIC FRONTEND FOR UNIFIED RENDER DEPLOYMENT ---
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Fallback (Catch-all for React Router)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
// --- SOCKET.IO ---
io.on('connection', (socket) => {
  console.log(`[Realtime Events] Client connected: ${socket.id}`);
  
  // Kitchen Fetch Response
  socket.on('request_orders', async () => {
    try {
      const orders = await prisma.order.findMany({ include: { items: true } });
      const formattedOrders = orders.map(o => ({
        ...o,
        items: o.items.map(i => ({
          id: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          isAdditional: i.isAdditional,
          addedAt: i.addedAt,
        }))
      }));
      socket.emit('initial_orders', formattedOrders);
    } catch (err) {
      console.error('[Error] Fetching initial orders via socket:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Realtime Events] Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Server] Production Backend running on port ${PORT}`);
});
