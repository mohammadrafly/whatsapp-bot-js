class MenuManager {
    constructor(client) {
        this.client = client;
    }

    Menu(message) {
        const userNumber = message.from;
        const menu = `
            Opsi yang tersedia:
            \n1. Tambah tugas dengan format "!add/judul/deskripsi/waktu/tanggal/bulan/tahun".
            \n2. Lihat daftar tugas dengan "!list"
            \n3. Request makanan acak "!airdrop"
            \n4. Conver foto menjadi sticker, kirim foto melalui Gallery dan beri quote "!sticker/author/names"
        `;
        this.client.sendMessage(userNumber, menu);
    }
}

module.exports = MenuManager;
