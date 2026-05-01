# CLAUDE.md — SIERA Portal Context File

Baca file ini setiap kali memulai sesi Claude Code baru.
Jangan mulai coding sebelum membaca dan memahami seluruh konteks di sini.

---

## Tentang Project

**Nama:** SIERA Portal (Smart Integrated Erajaya Retail Analytics)
**URL Deploy:** si-era.netlify.app
**Owner:** Ghesang Pratano L. — VMD Assistant Manager, Region 5 Erajaya Digital
**Region:** Region 5 — Jakarta, Tangerang, Banten
**Brand yang dikelola:** Erafone, iBox, Samsung Store
**Total stores:** 102+ stores aktif

SIERA adalah unified internal dashboard portal yang menjadi pintu masuk ke semua tools operasional Region 5. Setiap divisi punya modul masing-masing yang bisa diakses dari dashboard utama.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Vanilla JS, HTML5, CSS3 — NO framework |
| Font | DM Sans (Google Fonts) |
| Data | Google Sheets API v4 |
| Automation | Google Apps Script |
| WA Notif | Fonnte API |
| AI Insights | Claude API (claude-sonnet-4-20250514) |
| Hosting | Netlify (drag & drop deploy) |
| Version Control | GitHub |

**Prinsip coding:**
- Vanilla JS only — tidak pakai React, Vue, atau framework apapun
- Setiap modul adalah file HTML mandiri, tidak perlu build process
- CSS inline atau `<style>` dalam file yang sama
- Tidak ada npm, tidak ada node_modules
- Deploy = upload folder ke Netlify, selesai

---

## Struktur Folder

```
siera-portal/
├── index.html          ← Landing / login page
├── dashboard.html      ← Main hub (4 divisi)
├── config.example.js   ← Template config (di-commit ke GitHub)
├── config.js           ← API keys aktif (JANGAN commit, ada di .gitignore)
├── .gitignore
├── README.md
├── CLAUDE.md           ← File ini
└── modules/
    ├── OPERATIONS/
    │   └── index.html  ← ERA-SALES
    ├── RCM/
    │   └── index.html  ← ERA-ANALYTICS + ERA-PROMO
    ├── RMO/
    │   └── index.html  ← ERA-VIS + SIGNTAX-ERA
    └── RCD/
        └── index.html  ← ERA-SITE (Coming Soon)
```

---

## Design System

### Warna per Divisi

| Divisi | Accent | Background | Border |
|---|---|---|---|
| OPERATIONS | `#4F46E5` (indigo) | `#eef2ff` | `#c7d2fe` |
| RCM | `#7C3AED` (violet) | `#f5f3ff` | `#ddd6fe` |
| RMO | `#d97706` (amber) | `#fffbeb` | `#fde68a` |
| RCD | `#ea580c` (orange) | `#fff7ed` | `#fed7aa` |
| Global accent | `#4F46E5` | — | — |
| Success | `#16a34a` | `#f0fdf4` | `#bbf7d0` |
| Warning | `#d97706` | `#fffbeb` | `#fde68a` |

### Typography
- Font: **DM Sans** — import dari Google Fonts
- Heading utama: `font-size: 28px; font-weight: 800; letter-spacing: -0.8px`
- Sub heading: `font-size: 17px; font-weight: 800`
- Body: `font-size: 13px; color: #6b7280; line-height: 1.6`
- Label/tag: `font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase`

### Prinsip Desain
- **Clean flat** — background putih total (`#fff`), zero decoration
- **No gradients, no shadows berat, no blob/shape dekoratif**
- Border tipis: `1px solid #f1f2f6`
- Border radius card: `12px`
- Border radius badge/pill: `6px`
- Divider antar section: `1px solid #f1f2f6`
- Hover state card: `background: #fafafa` — subtle, tidak dramatis
- Semua warna teks mengacu ke variabel warna divisi masing-masing

### Komponen Standar
- **Metric card:** background `#fff`, border `1px solid #f1f2f6`, padding `16px`, border-radius `12px`
- **Division card:** padding `22px`, hover `background: #fafafa`, arrow icon muncul saat hover
- **Badge/pill:** `font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid`
- **Button primary:** background warna divisi, color `#fff`, border-radius `8px`, padding `13px`, full width
- **Navbar:** `border-bottom: 1px solid #f1f2f6`, height `68px`, logo indigo square

---

## Modul & Status

### OPERATIONS → ERA-SALES
**Status:** Sudah ada versi sebelumnya, perlu di-port dan di-refactor
**Fungsi:**
- Update sales harian dan mingguan 102+ store
- Target tracking per store (Samsung A57, A37, dll)
- Ranking toko, alert merah/hijau vs target
- Weekly report generator otomatis
- AI Insights via Claude API

**Data source:** Google Sheets (MELATI pipeline)
**Notif:** Fonnte WA

---

### RCM → ERA-ANALYTICS + ERA-PROMO
**Status:** ERA-ANALYTICS sudah ada, ERA-PROMO baru (planned)
**Fungsi ERA-ANALYTICS:**
- Store diagnostic framework 12 dimensi
- 12 dimensi: Location, VMD, Financial, Product Mix, People, Promo, Digital, Activity, Traffic, Competitor, Customer, Operations
- Output keputusan: Keep / Improve / Relocate / Close
- AI-powered rekomendasi

**Fungsi ERA-PROMO (planned):**
- Buat dan tracking program promosi
- Budget allocation per store/area
- ROI measurement kampanye
- Special project pipeline

---

### RMO → ERA-VIS + SIGNTAX-ERA
**Status:** Kedua tools sudah ada dan live, perlu di-integrate ke portal
**Fungsi ERA-VIS:**
- VMD compliance monitoring 135 store
- Upload foto compliance
- 3-level WA escalation otomatis: Store Leader → Area → Regional
- Weekly Report Generator
- AI Insights token-efficient

**Fungsi SIGNTAX-ERA:**
- Manajemen pajak reklame (pajak reklame) 102 store
- Vendor: ELFABI dan CAKRA
- Reminder otomatis H-60, H-30, H-7 via Fonnte
- Drag-and-drop Store Leader database upload

---

### RCD → ERA-SITE
**Status:** Coming Soon — TBC requirement dengan RCD team
**Fungsi planned:**
- Pipeline site acquisition (lokasi baru)
- Channel development tracking (Erafone/iBox/Samsung Store)
- Maintenance scheduling per store
- Renewal alert kontrak sewa

---

## Config & API Keys

Semua API keys dan credentials ada di `config.js` (tidak di-commit).
Template ada di `config.example.js`.

```javascript
// config.js — JANGAN commit file ini
const CONFIG = {
  GOOGLE_SHEETS_API_KEY: '',
  SPREADSHEET_ID_SALES: '',
  SPREADSHEET_ID_VIS: '',
  SPREADSHEET_ID_SIGNTAX: '',
  FONNTE_TOKEN: '',
  CLAUDE_API_KEY: '',
  REGION: 'Region 5',
  TOTAL_STORES: 102,
};
```

Cara load di setiap HTML module:
```html
<script src="../../config.js"></script>
<!-- atau dari root -->
<script src="../config.js"></script>
```

---

## Konvensi Penamaan

- File HTML: `index.html` di dalam folder masing-masing modul
- CSS class: kebab-case (`div-card`, `metric-row`, `nav-brand`)
- JS function: camelCase (`fetchSalesData`, `renderCard`, `sendWANotif`)
- JS variable: camelCase (`totalStores`, `weeklyTarget`)
- Konstanta: UPPER_SNAKE (`API_KEY`, `SHEET_ID`)

---

## Workflow Deploy

1. Edit file lokal
2. Test di browser (buka file langsung atau live server)
3. Commit ke GitHub: `git add . && git commit -m "pesan" && git push`
4. Deploy ke Netlify: drag folder `siera-portal/` ke Netlify Drop
   ATAU connect GitHub repo untuk auto-deploy

**Penting:** `config.js` selalu ada di `.gitignore` — jangan pernah commit file ini.

---

## Personas & Users

| Role | Akses | Keterangan |
|---|---|---|
| VMD Asst. Manager | Semua modul | Ghesang — owner |
| VMD Manager | Semua modul | Pak Ferly |
| HOR Region 5 | Dashboard + read-only | Pak Andre |
| Finance | SIGNTAX-ERA | Mba Tiska |
| Media Promo | RMO | Pak Wisnu |

---

## Hal yang TIDAK boleh dilakukan

- Jangan install npm packages atau buat package.json
- Jangan pakai framework (React, Vue, Angular, Svelte)
- Jangan commit `config.js`
- Jangan ubah struktur folder tanpa konfirmasi
- Jangan hapus atau overwrite file yang sudah ada tanpa tanya dulu
- Jangan hardcode API keys di dalam HTML/JS file

---

## Prompt Standar untuk Memulai Sesi Baru

Gunakan prompt ini setiap buka Claude Code session baru:

> "Baca CLAUDE.md. Kita lanjut build SIERA Portal Region 5. [jelaskan task hari ini]"

---

*Last updated: Mei 2026 — Ghesang Pratano L.*
