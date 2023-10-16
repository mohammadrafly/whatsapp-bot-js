class MenuManager {
    constructor(client) {
        this.client = client;
    }

    Menu(message) {
        const userNumber = message.from;
        const menu = `
======================================
            Menu Pilihan
======================================
1. Tambah Tugas:
   Format: !add/judul/deskripsi/waktu/tanggal/bulan/tahun

2. Lihat Daftar Tugas:
   Gunakan: !list

3. Request Makanan Acak:
   Gunakan: !airdrop

4. Convert Foto Menjadi Sticker:
   Kirim foto via Gallery dan beri quote:
   !sticker/author/names

Pilihan Anda (misal, ketik "!add/Belajar/Node Js/15:00/15/10/2023" untuk menambah tugas):`;
        this.client.sendMessage(userNumber, menu);
    }
}

module.exports = MenuManager;