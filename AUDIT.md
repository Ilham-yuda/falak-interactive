# FALAK INTERACTIVE - Senior Front-End Code Audit

## Ringkasan
Audit dilakukan terhadap struktur HTML, CSS, JavaScript, navigasi relatif, data 30 hari, bank quiz, flashcard, localStorage, kalkulator, search, dan aksesibilitas dasar.

## Temuan utama dan perbaikan

### 1. Broken navigation Previous/Next materi
**Temuan:** fungsi `openDay()` selalu memakai `pages/materi.html`. Saat dipanggil dari `pages/materi.html`, URL lama dapat menjadi `pages/pages/materi.html`.
**Perbaikan:** semua navigasi materi sekarang melewati `APP.url()` yang menghitung path relatif sesuai halaman saat ini.

### 2. Mini quiz belum benar-benar tersedia di materi
**Temuan:** halaman materi hanya memiliki tautan ke quiz harian, padahal spesifikasi meminta mini quiz pada setiap hari.
**Perbaikan:** setiap materi sekarang menampilkan 3 soal mini dengan feedback langsung.

### 3. Input pengguna dimasukkan langsung ke `innerHTML`
**Temuan:** catatan observasi, ringkasan proyek, hasil pencarian, dan data dinamis dapat memasukkan teks mentah ke DOM.
**Perbaikan:** ditambahkan `APP.escapeHtml()` dan semua area dinamis yang berasal dari input/data pengguna di-escape.

### 4. localStorage belum sepenuhnya tahan terhadap error
**Temuan:** `get()` sudah memiliki fallback, tetapi `set()` dapat melempar error saat storage penuh atau tidak tersedia.
**Perbaikan:** `Progress.set()` sekarang menangani kegagalan storage tanpa menghentikan aplikasi.

### 5. Statistik jumlah percobaan quiz salah
**Temuan:** ekspresi lama selalu menghasilkan hitungan yang sama.
**Perbaikan:** jumlah percobaan dihitung dari jumlah mode quiz yang tersimpan.

### 6. Progress hari terakhir belum konsisten
**Temuan:** membuka materi melalui beberapa jalur tidak selalu menyimpan `lastVisitedDay`.
**Perbaikan:** `materials()` dan `openDay()` kini memanggil `Progress.setLastDay()`.

### 7. Perbandingan BMKG × Stellarium tidak menangani jam
**Temuan:** `Sunset` dan `Moonset` diperlakukan sebagai angka. Input `18:00` menjadi `NaN`.
**Perbaikan:** dua parameter waktu sekarang diparse sebagai menit sejak tengah malam; parameter sudut tetap diproses sebagai angka.

### 8. Flashcard belum memiliki interaksi keyboard pada kartu
**Temuan:** kartu dapat di-flip dengan klik, tetapi interaksi keyboard belum tersedia.
**Perbaikan:** kartu mempunyai `tabindex`, `role`, `aria-label`, dan handler Enter/Space.

### 9. Flashcard state kosong belum ditangani secara eksplisit
**Temuan:** render bergantung pada data yang selalu tersedia.
**Perbaikan:** render sekarang menampilkan fallback jika bank flashcard kosong.

### 10. Validasi quiz untuk pool kosong kurang aman
**Temuan:** mode atau hari yang tidak memiliki soal dapat menghasilkan state kosong.
**Perbaikan:** `Quiz.render()` sekarang memberi pesan aman dan day query dinormalisasi ke 1–30.

### 11. Quiz Hari 7 tidak memenuhi review 10 soal
**Temuan:** mode daily sebelumnya selalu 3 soal.
**Perbaikan:** Hari 7 sekarang memulai 10 soal; hari lain tetap 3 soal untuk mini/daily.

### 12. Focus state aksesibilitas belum eksplisit
**Temuan:** beberapa kontrol tidak mempunyai indikator fokus keyboard yang seragam.
**Perbaikan:** ditambahkan `:focus-visible` global dan style tombol disabled.

### 13. Prefer-reduced-motion belum tersedia
**Temuan:** pengguna yang mengurangi animasi tetap menerima animasi penuh.
**Perbaikan:** ditambahkan media query `prefers-reduced-motion`.

### 14. ID dinamis tabel perbandingan menggunakan spasi
**Temuan:** ID seperti `diff-Azimuth Matahari` tidak ideal untuk selector dan pemeliharaan.
**Perbaikan:** key internal dinormalisasi menjadi `sunAz`, `moonAz`, `altitude`, dan `elongation`.

### 15. Video YouTube bukan semuanya direct watch URL
**Temuan:** versi sebelumnya menggunakan URL hasil pencarian YouTube untuk sebagian besar hari. URL tersebut valid dan tidak rusak, tetapi bukan URL video tertentu.
**Perbaikan:** model data sekarang membedakan link `Watch on YouTube` dan `Cari di YouTube`. Dua video direct watch yang dapat diverifikasi melalui hasil web audit digunakan sebagai override. Hari lain tetap menggunakan pencarian topik agar tidak mengarang ID video.

## Verifikasi kuantitatif

- Roadmap: 30 hari
- Materi: 30 hari
- Video entry: 30
- Bank quiz: 120 soal
- Flashcard: 87
- Glosarium: 83 istilah
- Duplicate ID statis: 0
- JavaScript syntax errors: 0 berdasarkan `node --check`
- Referensi internal HTML yang dicek secara statis: tidak ditemukan target file lokal yang hilang

## Batas verifikasi runtime

Server HTTP lokal berhasil merespons resource proyek. Headless Chromium di lingkungan eksekusi mengalami timeout proses setelah halaman mulai dimuat, sehingga saya tidak mengklaim pengujian visual interaktif penuh seperti pengguna akhir di Chrome desktop.

DNS keluar dari lingkungan eksekusi juga tidak tersedia untuk `requests`, sehingga status HTTP eksternal tidak saya klaim dari lingkungan lokal. Verifikasi sumber BMKG, Stellarium, dan beberapa URL YouTube dilakukan melalui pencarian web.

## Catatan akademik

Aplikasi tetap merupakan media pembelajaran. Kalkulator arah kiblat, simulasi BMKG × Stellarium, dan simulasi sidang isbat tidak menetapkan keputusan hukum keagamaan secara otomatis.
