---
title: Penambangan
description: Panduan untuk menambang di Stacks 2.0
sidebar_position: 4
---

## Pengantar

Panduan ini menggaris bawahi beberapa detail teknis terkait menambang pada jaringan Stacks 2.0.

For steps on how to setup your own miner please refer to [miner on testnet](nodes-and-miners/miner-testnet.md) and [miner on mainnet](nodes-and-miners/miner-testnet.md).

## Frekuensi menambang

Blok Stacks baru dapat ditambang satu kali per blok Bitcoin. Untuk dapat dipertimbangkan menambang sebuah blok, seorang penambang harus memiliki komit blok yang disertakan dalam blok Bitcoin. Jika penambang ingin memperbarui komitmen mereka setelah pengumpulan, mereka dapat menggunakan Bitcoin Replace-By-Fee.

## Hadiah coinbase

Penambang menerima hadiah coinbase untuk blok yang mereka menangkan.

Jumlah hadiahnya adalah:

- 1000 STX per blok dikeluarkan pada 4 tahun pertama penambangan
- 500 STX per blok dikeluarkan selama 4 tahun berikutnya
- 250 STX per blok dikeluarkan selama 4 tahun berikutnya
- 125 STX per blok dikeluarkan mulai dari saat itu dan seterusnya.

"Halving" ini disinkronkan dengan halving Bitcoin.

![hadiah coinbase](/img/pages/coinbase-rewards.png)

## Biaya transaksi

Penambang menerima biaya Stacks untuk transaksi yang ditambang untuk setiap blok yang mereka produksi.

Untuk transaksi yang ditambang di mikroblok, penambang yang memproduksi mikroblok menerima 40% dari biaya, sedangkan penambang yang mengkonfirmasi mikroblok menerima 60% dari biaya.

## Maturitas hadiah

Hadiah blok dan biaya transaksi membutuhkan 100 blok pada jaringan Bitcoin untuk menjadi matur. Setelah berhasil menambang blok, hadiah akan muncul di akun Stacks selama kurang lebih ~24 jam.

## Menambang menggunakan proof-of-transfer

Penambang berkomitmen mengeluarkan Bitcoin ke **dua** alamat pada setiap pemilihan ketua blok. Jumlah yang dikomit untuk setiap alamat harus sama. Alamat dipilih dari peserta penerima hadiah stacking saat ini. Alamat dipilih menggunakan fungsi-acak-terverifikasi, dan menentukan dua alamat yang tepat untuk blok tertentu memerlukan pemantauan rantai Stacks.

![menambang dengan pox](/img/pages/mining-with-pox.png)

Penambangan PoX adalah modifikasi dari penambangan Proof-of-Burn (PoB), alih-alih mengirim Bitcoin yang berkomitmen ke alamat pembakaran, Bitcoin akan ditransfer ke pemegang STX yang memenuhi syarat yang berpartisipasi dalam protokol stacking.

:::note
A PoX miner can only receive newly minted STX tokens when they transfer Bitcoin to eligible owners of STX tokens
:::

![Alur menambang](/img/pox-mining-flow.png)

Penambang menjalankan noda Stacks dengan penambangan aktif untuk berpartisipasi dalam mekanisme PoX. Noda mengimplementasikan mekanisme PoX, yang memastikan penanganan dan insentif yang tepat melalui empat fase utama:

- Pendaftaran: penambang mendaftar untuk pemilihan mendatang dengan mengirimkan data konsensus ke jaringan
- Komitmen: penambang terdaftar mentransfer Bitcoin untuk berpartisipasi dalam pemilihan. BTC yang berkomitmen dikirim ke satu kumpulan pemegang token STX yang berpartisipasi
- Pemilihan: fungsi acak terverifikasi memilih satu penambang untuk menulis blok baru di blockchain Stacks
- Perakitan: penambang terpilih menulis blok baru dan mengumpulkan hadiah dalam bentuk token STX baru

## Kemungkinan untuk menambang blok berikutnya

Penambang yang dipilih untuk menambang blok berikutnya dipilih tergantung pada jumlah BTC yang dikirim oleh penambang, yaitu ditransfer atau dibakar.

Kemungkinan penambang untuk menambang blok berikutnya sama dengan BTC yang dikirim penambang dibagi dengan total BTC yang dikirim oleh semua penambang.

Meskipun tidak ada komitmen BTC minimum yang diwajibkan oleh protokol, dalam praktiknya, ada batasan yang dibatasi oleh [dust](https://unchained-capital.com/blog/dust-thermodynamics/)": yang pada dasarnya, jika biaya untuk suatu transaksi melebihi nilai pengeluaran yang dikeluarkan, itu dianggap sebagai dust. Bagaimana dust [dihitung](https://github.com/bitcoin/bitcoin/blob/master/src/policy/policy.cpp#L14) tergantung dari beberapa faktor, kita menemukan bahwa 5.500 satoshi adalah batas bawah untuk setiap [keluaran](https://learnmeabitcoin.com/technical/output). Transaksi Bitcoin dari penambang Stacks memiliki dua keluaran (untuk Proof-of-Transfer), jadi suatu komitmen paling tidak 11,000 satoshi / blok yang direkomendasikan.

Untuk menghitung jumlah BTC yang dikirim penambang harus:

- Menebak harga BTC/STX untuk hari berikutnya (100 blok kemudian)
- Menebak jumlah BTC yang digunakan oleh semua penambang

## Mikroblok

Jaringan blokchain Stacks membuat blok pada kecepatan yang sama seperti blockchain Bitcoin. Untuk menghasilkan latensi transaksi yang lebih rendah, penambang dapat mengaktifkan mikroblok. Mikroblok memungkinkan pemimpin blok saat ini untuk mengalirkan transaksi dan memasukkan status transisinya ke dalam epoch saat ini.

Jika suatu pemimpin blok memilih untuk memproduksi mikroblok, pemimpin berikutnya harus membuat rantai dari ujung transaksi mikroblok yang pemimpin saat ini hasilkan.

Model streaming blok dijelaskan di [SIP-001][].

[SIP-001]: https://github.com/stacksgov/sips/blob/main/sips/sip-001/sip-001-burn-election.md#operation-as-a-leader