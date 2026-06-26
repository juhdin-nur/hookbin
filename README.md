# Hookbin

Tool lokal untuk menangkap, memeriksa, dan men-debug HTTP request secara real-time. Cocok untuk pengujian webhook, API, dan integrasi HTTP lainnya.

## Fitur

- Tangkap semua HTTP method: GET, POST, PUT, PATCH, DELETE
- Tampilan real-time via WebSocket (Socket.io)
- Inspeksi detail: headers, query params, body, cookies
- Dukungan file upload — tampilkan nama file, MIME type, ukuran, dan field name
- Multi-endpoint (bucket) — buat dan kelola beberapa endpoint sekaligus
- Template curl siap pakai untuk setiap HTTP method
- Tanpa database — data disimpan di memory

## Struktur Project

```
project-hookbin/
├── src/
│   ├── server.ts       # Express + Socket.io server
│   ├── store.ts        # In-memory store per bucket
│   └── types.ts        # TypeScript types (server)
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RequestCard.tsx     # Detail satu request
│   │   │   ├── RequestList.tsx     # Daftar request
│   │   │   ├── WebhookUrl.tsx      # Panel URL & session
│   │   │   ├── CurlTemplates.tsx   # Template curl
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   ├── useWebhook.ts       # Socket.io + fetch
│   │   │   └── useSessions.ts      # Manajemen bucket
│   │   └── types.ts                # TypeScript types (client)
│   └── test                        # Script curl untuk testing
├── .env                            # Konfigurasi server
└── client/.env                     # Konfigurasi client
```

## Prasyarat

- Node.js v18+
- npm

## Setup

### 1. Clone & install dependencies

```bash
# Install dependencies server
npm install

# Install dependencies client
cd client && npm install && cd ..
```

### 2. Konfigurasi environment

**Server** — edit `.env`:
```env
PORT=3005
CORS_ORIGIN=*
```

**Client** — edit `client/.env`:
```env
VITE_BACKEND_URL=http://<IP_SERVER>:3005
```

Ganti `<IP_SERVER>` dengan IP mesin yang menjalankan server (contoh: `localhost`). Gunakan `localhost` jika server dan browser di mesin yang sama.

### 3. Jalankan server

```bash
npm run dev
```

Server berjalan di `http://localhost:3005`.

### 4. Jalankan client (terminal terpisah)

```bash
cd client
npm run dev
```

Frontend berjalan di `http://localhost:5174`. Buka di browser.

## Penggunaan

### Membuat endpoint

Saat pertama kali membuka browser, endpoint (bucket) dibuat otomatis. URL-nya tampil di bagian atas halaman, contoh:

```
http://localhost:3005/a1b2c3d4
```

Salin URL ini lalu gunakan sebagai target webhook atau request HTTP.

### Mengirim request

Kirim request HTTP ke URL endpoint menggunakan curl, Postman, atau dari aplikasi lain.

**GET dengan query params:**
```bash
curl "http://localhost:3005/a1b2c3d4?page=1&limit=10"
```

**POST JSON:**
```bash
curl -X POST "http://localhost:3005/a1b2c3d4" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

**PUT:**
```bash
curl -X PUT "http://localhost:3005/a1b2c3d4" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"John Updated","active":true}'
```

**PATCH:**
```bash
curl -X PATCH "http://localhost:3005/a1b2c3d4" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"status":"inactive"}'
```

**DELETE:**
```bash
curl -X DELETE "http://localhost:3005/a1b2c3d4" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"reason":"user_request"}'
```

**Upload file (multipart/form-data):**
```bash
curl -X POST "http://localhost:3005/a1b2c3d4" \
  -F "avatar=@/path/to/photo.jpg" \
  -F "user_id=42" \
  -F "caption=Profile photo"
```

> **Catatan:** Gunakan `@` sebelum path file agar curl mengirim isi file, bukan string path.

**Dengan cookie:**
```bash
curl -X POST "http://localhost:3005/a1b2c3d4" \
  -H "Content-Type: application/json" \
  -H "Cookie: session=abc123; token=xyz789" \
  -d '{"action":"login"}'
```

### Informasi yang ditampilkan per request

| Seksi | Isi |
|---|---|
| **Body** | JSON, teks, atau form data |
| **Query Params** | Semua parameter dari URL |
| **Files** | Field, nama file, MIME type, ukuran (untuk upload) |
| **Headers** | Semua HTTP header termasuk Cookie |

Klik label seksi untuk membuka/menutup detail.

### Template curl

Klik **curl Templates** di bawah panel URL untuk melihat contoh perintah curl siap pakai. Pilih method (GET, POST, Upload, PUT, PATCH, DELETE) lalu klik **Copy** untuk menyalin ke clipboard.

### Multi-endpoint

- Klik **+ New Endpoint** untuk membuat bucket baru
- Klik URL endpoint lama di daftar untuk beralih
- Klik **✕** untuk menghapus endpoint yang tidak digunakan

### Script test

File `client/test` berisi contoh curl untuk semua skenario. Edit variabel `BASE` terlebih dahulu sesuai URL endpoint yang aktif di browser:

```bash
# Edit BASE di baris pertama
BASE=http://localhost:3005/<bucket-id>

# Jalankan dari root project
bash client/test
```

## API Server

| Method | Endpoint | Keterangan |
|---|---|---|
| `ANY` | `/:bucketId` | Tangkap request ke bucket |
| `GET` | `/api/bucket/:bucketId` | Ambil semua request di bucket |
| `DELETE` | `/api/bucket/:bucketId` | Hapus semua request di bucket |

## Catatan

- Data disimpan di memory — hilang saat server di-restart
- Maksimum 100 request per bucket (request terlama dihapus otomatis)
- File yang diupload tidak disimpan ke disk — hanya metadata yang ditampilkan
- Bucket ID disimpan di `localStorage` browser
