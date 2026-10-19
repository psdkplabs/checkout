## Secret Scanning dengan Gitleaks dan Husky

Project ini menggunakan **Gitleaks** dan **Husky** untuk mendeteksi credential atau secret sebelum perubahan di-commit ke repository.

Husky menjalankan Gitleaks secara otomatis melalui Git `pre-commit` hook. Jika Gitleaks menemukan secret pada file yang sudah di-stage, proses commit akan dibatalkan.

### Prerequisites

Pastikan Git dan Gitleaks sudah terinstall.

Cek instalasi Gitleaks:

```bash
gitleaks version
```

Project ini telah diuji menggunakan:

```text
Gitleaks 8.30.0
```

### Instalasi Gitleaks

#### Windows

Gitleaks dapat diinstall menggunakan WinGet:

```powershell
winget install --id Gitleaks.Gitleaks
```

Verifikasi instalasi:

```powershell
gitleaks version
```

### Instalasi Dependency Project

Setelah repository di-clone:

```bash
git clone <repository-url>
cd <nama-project>
```

Install dependency:

```bash
bun install
```

Husky kemudian dapat diinisialisasi dengan:

```bash
bunx husky
```

Pastikan file berikut tersedia:

```text
.husky/pre-commit
```

### Konfigurasi Pre-commit

File `.husky/pre-commit` menjalankan:

```sh
#!/usr/bin/env sh

echo "Running Gitleaks secret scan..."

gitleaks git --pre-commit --staged --redact --verbose
```

Gitleaks hanya memeriksa perubahan yang telah masuk ke staging area.

Contoh:

```bash
git add .
git commit -m "example commit"
```

Sebelum commit dibuat, Husky akan menjalankan Gitleaks secara otomatis.

### Jika Tidak Ada Secret

Jika tidak ditemukan secret, Gitleaks akan menghasilkan:

```text
no leaks found
```

dan commit akan dilanjutkan.

### Jika Secret Ditemukan

Jika terdapat secret pada staged changes, Gitleaks akan menampilkan informasi seperti:

```text
Finding:     API_KEY=REDACTED
Secret:      REDACTED
RuleID:      generic-api-key
File:        example.txt

WRN leaks found: 1
```

Kemudian Husky akan menghentikan commit:

```text
husky - pre-commit script failed (code 1)
```

Artinya secret berhasil dicegah agar tidak masuk ke Git history.

### Pengujian Secret Scanner

Jangan menggunakan credential asli untuk melakukan pengujian.

Buat file sementara:

```text
secret-test.txt
```

Contoh dummy secret:

```text
AWS_ACCESS_KEY_ID=AKIALALEMEL33243OLIB
```

Stage file:

```bash
git add secret-test.txt
```

Kemudian coba commit:

```bash
git commit -m "test secret scanner"
```

Commit seharusnya diblokir oleh Gitleaks.

Setelah pengujian selesai, hapus file tersebut:

```bash
git restore --staged secret-test.txt
rm secret-test.txt
```

> **Penting:** Jangan commit atau push `secret-test.txt` maupun credential asli ke repository.

### Menjalankan Gitleaks Secara Manual

Untuk memeriksa staged changes:

```bash
gitleaks git --pre-commit --staged --redact --verbose
```

Untuk memindai seluruh directory:

```bash
gitleaks dir . --redact --verbose
```

### Alur Secret Scanning

```text
git add
   |
   v
git commit
   |
   v
Husky pre-commit
   |
   v
Gitleaks
   |
   +---- Tidak ada secret ----> Commit berhasil
   |
   +---- Secret ditemukan ----> Commit dibatalkan
```
