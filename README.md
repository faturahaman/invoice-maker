# Invoice Generator

Bikin invoice PDF langsung dari browser. Isi formnya, preview-nya langsung
kelihatan di sebelah, lalu unduh. Semua proses render terjadi di browser kamu
sendiri, jadi tidak ada data invoice yang dikirim ke server mana pun.

Ini project sampingan, dibuat buat dipakai sendiri dan di-host di Vercel.

## Apa yang bisa dilakukan

Kamu isi sendiri identitas pengirimnya: nama instansi, yayasan, judul header,
alamat, kontak, sampai logo (PNG/JPG/GIF/WebP). Tidak ada daftar instansi yang
dikunci di kode. Kalau sering pakai pengirim yang sama, simpan saja, nanti
tinggal dipilih lagi tanpa ngetik ulang. Datanya cuma tersimpan di browser kamu.

Selain itu ada beberapa hal yang bisa diatur:

- Mata uang dan format angka/tanggal (IDR, USD, EUR, dan lainnya)
- Warna aksen buat header, tabel, dan total
- Baris pajak (persen) dan diskon, kalau memang perlu
- Item tagihan, skema pembayaran bertahap dengan nomor Virtual Account, data
  penerima yang bisa ditambah-kurang, dan catatan

Draft-nya juga tersimpan otomatis, jadi kalau tab ketutup atau browser ke-refresh
isian kamu tidak hilang.

## Cara menjalankan di lokal

Butuh Node.js versi 18.17 ke atas.

```bash
npm install
npm run dev
```

Buka http://localhost:3000. Selesai. Dashboard-nya tidak butuh environment
variable apa pun karena semua jalan di browser.

Kalau mau pakai API HTTP-nya (opsional, dijelasin di bawah), baru salin env-nya:

```bash
cp .env.example .env.local
```

Perintah lain yang ada:

- `npm run dev` — jalan development, auto reload
- `npm run build` — build produksi
- `npm run start` — jalanin hasil build
- `npm run lint` — cek ESLint
- `npm run typecheck` — cek TypeScript
- `npm run render-sample` — render satu PDF contoh buat ngetes

## Deploy ke Vercel

Push repo ini ke GitHub, lalu di Vercel pilih Add New, Project, terus import
repo-nya. Vercel otomatis kenal ini project Next.js, jadi tidak perlu setting
build apa pun. Tinggal deploy.

Environment variable cuma diperlukan kalau kamu mau memakai API HTTP-nya:

- `VALID_API_KEYS` — daftar API key dipisah koma. Bikin yang acak, misalnya
  pakai `openssl rand -hex 32`.
- `ALLOWED_ORIGINS` — daftar origin yang boleh akses via CORS, dipisah koma,
  atau `*` buat semua.

Endpoint API-nya di-set punya batas waktu 30 detik supaya invoice yang besar
tidak keburu timeout di plan Hobby, dan jalan di Node.js runtime karena library
PDF-nya butuh itu.

## API HTTP (opsional)

Dashboard tidak memakai API ini. Endpoint-nya cuma disediakan kalau kamu mau
generate invoice dari sistem lain secara otomatis.

Kirim POST ke `/api/v1/invoice/generate` dengan header:

```
Authorization: Bearer API_KEY_KAMU
Content-Type: application/json
```

Body-nya seperti ini. Identitas pengirim bisa dikirim langsung lewat `issuer`,
atau kalau mau merujuk preset bawaan pakai `template_id` (salah satu wajib ada):

```jsonc
{
  "issuer": {
    "name": "SMA Harapan Bangsa",
    "foundationName": "Yayasan Pendidikan Nusantara",
    "headerTitle": "INVOICE PEMBAYARAN",
    "address": "Jl. Merdeka No. 45, Jakarta Pusat 10110",
    "contact": "(021) 555-0123 · keuangan@sekolah.id",
    "logoDataUri": ""
  },
  "settings": {
    "currency": "IDR",
    "locale": "id-ID",
    "accentColor": "#0F766E",
    "tax": { "enabled": true, "label": "PPN", "rate": 11 },
    "discount": { "enabled": false, "label": "Diskon", "amount": 0 }
  },
  "invoice_number": "INV/2026/07/001",
  "date": "2026-07-31",
  "recipient": {
    "fields": [
      { "label": "Nama", "value": "Budi Santoso" },
      { "label": "Kelas", "value": "X IPA 1" }
    ]
  },
  "items": [
    { "no": 1, "description": "Biaya Pendaftaran", "amount": 500000, "va": "8801234567890" }
  ],
  "payment_schemes": [],
  "notes": ["Simpan bukti pembayaran."],
  "signatory": { "position": "Kepala Keuangan", "name": "Dr. Siti Aminah, M.M." },
  "output": "pdf"
}
```

Kalau berhasil, responsnya langsung file PDF. Kalau gagal: 401 berarti API
key-nya salah atau tidak ada, 413 kalau body-nya lebih dari 2 MB, 422 kalau
JSON-nya tidak valid, dan 500 kalau render-nya gagal.

Contoh pakai cURL:

```bash
curl -X POST https://namaapp.vercel.app/api/v1/invoice/generate \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d @invoice.json \
  --output invoice.pdf
```

Ada beberapa batasan supaya aman: body maksimal 2 MB, logo maksimal sekitar
800 KB dan harus raster (PNG/JPG/GIF/WebP, SVG tidak didukung), maksimal 200
item, 50 skema pembayaran, 100 catatan, dan 50 field penerima. Mata uang dan
locale juga dibatasi ke daftar yang didukung supaya tidak error waktu render.

## Susunan kode

```
src/
  app/
    page.tsx                    halaman dashboard
    layout.tsx                  root layout dan font
    api/v1/invoice/generate/    endpoint API
  components/
    dashboard/                  form, section, field, preview
    pdf/                        komponen PDF (Header, ItemsTable, dan lainnya)
  lib/
    schema/invoice.ts           kontrak payload API
    schema/invoiceForm.ts       schema form, default, contoh
    format.ts                   format uang dan hitung total
    senders.ts                  simpan pengirim di browser
    useAutosave.ts              autosave draft
    templates/registry.ts       preset pengirim
```

Satu hal yang perlu diingat kalau nanti mau ngoprek: identitas pengirim itu
bagian dari data yang diisi user, bukan daftar yang dikunci di server. Dan semua
perhitungan uang lewat satu fungsi di `src/lib/format.ts`, dipakai bareng sama
footer di form dan PDF-nya, biar angkanya selalu sama.

## Soal privasi

Dashboard bikin PDF sepenuhnya di browser. Data invoice tidak dikirim ke server
atau pihak ketiga. Pengirim yang kamu simpan cuma ada di browser perangkatmu.
API HTTP-nya terpisah dan sifatnya opsional.

## Lisensi

MIT, bebas dipakai dan diubah.
