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
   
`;
        this.client.sendMessage(userNumber, menu);
    }
}

module.exports = MenuManager;