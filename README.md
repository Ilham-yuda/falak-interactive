# FALAK INTERACTIVE

Modul Ajar Interaktif Ilmu Falak untuk mahasiswa Fakultas Syariah dan Hukum, khususnya Hukum Keluarga.

## Fitur
- Roadmap 30 hari
- 30 materi terstruktur
- 3 mini quiz pada setiap hari
- Bank 120 soal untuk quiz harian, mingguan, acak, dan ujian akhir
- Flashcard aktif recall (87 kartu)
- Kalkulator azimuth, altitude, UTC→WIB/WITA/WIT, lag, dan arah kiblat
- Tabel observasi dengan localStorage
- Perbandingan BMKG × Stellarium
- Search materi
- Glosarium (83 istilah)
- Dark mode dan light mode
- Responsive desktop/tablet/mobile
- Navigasi keyboard dan semantic HTML dasar
- Link sumber resmi BMKG, Stellarium, Kementerian Agama, dan NASA

## Menjalankan di Visual Studio Code
1. Buka folder `falak-interactive` di Visual Studio Code.
2. Pastikan struktur folder tetap seperti di proyek.
3. Install ekstensi **Live Server** dari Marketplace Visual Studio Code bila belum ada.
4. Klik kanan `index.html`.
5. Pilih **Open with Live Server**.
6. Browser akan membuka alamat localhost.

## Struktur
```text
falak-interactive/
├── index.html
├── README.md
├── AUDIT.md
├── css/style.css
├── js/data.js
├── js/app.js
├── js/quiz.js
├── js/flashcard.js
├── js/progress.js
├── assets/images/.gitkeep
├── assets/icons/.gitkeep
├── assets/audio/.gitkeep
└── pages/
    ├── materi.html
    ├── quiz.html
    ├── flashcard.html
    ├── praktik.html
    └── tentang.html
```

## Menambahkan materi
Edit `customContents` di `js/data.js`. Data roadmap berada pada `roadMap`. Builder `makeMaterial()` meneruskan field utama ke tampilan materi.

Field yang didukung antara lain:
- `intro`
- `explain`
- `example`
- `formula`
- `variables`
- `calculation`
- `practice`
- `reflection`
- `summary`

Setelah menambah atau mengubah materi, pastikan nomor hari tetap 1–30.

## Menambahkan video YouTube
Data video berada pada `videoQueries`, `videoTitles`, dan `verifiedVideoOverrides`.

Gunakan URL `https://www.youtube.com/watch?v=VIDEO_ID` hanya ketika ID video benar-benar sudah diverifikasi. Untuk menghindari link palsu, proyek menggunakan pencarian topik YouTube untuk entry yang belum memiliki ID terverifikasi.

## Menambahkan quiz
Bank soal utama berada di `miniQuizSeeds`. Sistem membangun 4 soal per hari menjadi total 120 soal.

Untuk soal khusus, tambahkan objek dengan struktur:
```js
{
  day: 1,
  week: 1,
  q: 'Pertanyaan',
  options: ['A', 'B', 'C', 'D'],
  answer: 0,
  explanation: 'Pembahasan'
}
```

## Menambahkan flashcard
Edit array `flashcards` dengan format:
```js
['Kategori', 'Pertanyaan', 'Jawaban']
```

## Sumber resmi utama
- BMKG Hilal: https://hilal.bmkg.go.id/
- Stellarium Web: https://stellarium-web.org/
- Kementerian Agama RI: https://kemenag.go.id/
- NASA Moon: https://science.nasa.gov/solar-system/moon/

## Catatan akademik
Kalkulator, simulasi, dan contoh pada situs ini merupakan media pembelajaran. Hasil harus divalidasi dengan sumber resmi, metode yang jelas, dan perangkat falak yang sesuai. Website tidak menetapkan keputusan hukum keagamaan secara otomatis.

## Fitur Interaktif & Gamifikasi
- Animasi orbit Bumi-Bulan-Matahari tanpa canvas berat.
- Simulator fase Bulan, mini planetarium, horizon, altitude, dan kompas azimuth.
- XP, level mahasiswa, streak belajar, tantangan harian, dan badge.
- Badge: Falak Pemula, Pengamat Langit, Navigator Kiblat, Ahli Hilal, Falak Explorer.
- Konfeti otomatis untuk hasil quiz minimal 80.
- Semua state gamifikasi disimpan melalui localStorage dengan fallback aman.

### XP
- Selesai materi: +20 XP
- Selesai quiz: +10 XP
- Quiz nilai >= 80: bonus +15 XP
- Mempelajari flashcard baru: +3 XP per kartu baru
- Menyimpan observasi: +10 XP
- Menyimpan proyek akhir: +10 XP
- Menyelesaikan tantangan harian: +25 XP

### Level
- Level 1: Falak Pemula
- Level 2: Pengamat Langit
- Level 3: Navigator Kiblat
- Level 4: Ahli Hilal
- Level 5: Falak Explorer
