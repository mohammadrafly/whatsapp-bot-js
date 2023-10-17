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

1. Convert Foto Menjadi Sticker:
   Kirim foto via Gallery dan beri CAPTION "!sticker"
   
2. Hapus Background Foto:
   Kirim foto via Document dan beri CAPTION "!remove-bg"
   
3. Compress Foto:
   Kirim foto via Document dan beri CAPTION "!compress"
   
`;
        this.client.sendMessage(userNumber, menu);
    }
}

module.exports = MenuManager;