import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { addRequest, getRequests, clearRequests } from './store.js';
import type { CapturedRequest } from './types.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? '*';

const corsOptions = CORS_ORIGIN === '*'
  ? { origin: true }
  : { origin: CORS_ORIGIN };

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, { cors: corsOptions });

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use(express.raw({ type: (req) => !req.headers['content-type'] }));

// REST: initial load
app.get('/api/bucket/:bucketId', (req, res) => {
  res.json(getRequests(req.params.bucketId));
});

// REST: clear bucket
app.delete('/api/bucket/:bucketId', (req, res) => {
  clearRequests(req.params.bucketId);
  res.json({ success: true });
});

// Catch-all: capture every HTTP method for a bucket
app.all('/:bucketId', upload.any(), (req, res) => {
  const { bucketId } = req.params;

  if (bucketId === 'favicon.ico') {
    res.status(204).end();
    return;
  }

  const multerFiles = (req.files as Express.Multer.File[] | undefined) ?? [];
  const files = multerFiles.map((f) => ({
    field: f.fieldname,
    filename: f.originalname,
    mimetype: f.mimetype,
    size: f.size,
  }));

  const captured: CapturedRequest = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bucketId,
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : (v ?? '')])
    ),
    query: Object.fromEntries(
      Object.entries(req.query).map(([k, v]) => [k, String(v)])
    ),
    body: req.body,
    files,
    ip: req.ip ?? req.socket.remoteAddress ?? '',
    timestamp: new Date().toISOString(),
  };

  addRequest(captured);

  const roomSize = io.sockets.adapter.rooms.get(bucketId)?.size ?? 0;
  console.log(`[request] ${req.method} /${bucketId} → emitting to ${roomSize} client(s) in room`);
  io.to(bucketId).emit('new_request', captured);

  res.status(200).json({ success: true, id: captured.id });
});

// Socket.io: room management per bucket
io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`);

  socket.on('join_bucket', (bucketId: string) => {
    socket.join(bucketId);
    console.log(`[socket] ${socket.id} joined room: "${bucketId}"`);
  });

  socket.on('leave_bucket', (bucketId: string) => {
    socket.leave(bucketId);
    console.log(`[socket] ${socket.id} left room: "${bucketId}"`);
  });

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Hookbin server running on http://localhost:${PORT}`);
});
