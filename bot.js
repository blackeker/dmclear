const { Client } = require('discord.js-selfbot-v13'); 
const { TOKEN } = require('./config'); 

const client = new Client(); 

client.once('ready', () => {
    console.log(`Bot ${client.user.tag} olarak giriş yaptı!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.id === client.user.id && message.content.startsWith('!clear')) {
        const args = message.content.split(' ');
        const kullanıcıID = args[1];

        if (!kullanıcıID) {
            return message.channel.send('Lütfen bir kullanıcı ID girin.');
        }

        try {
            const user = await client.users.fetch(kullanıcıID);
            const dmChannel = await user.createDM();

            let lastMessageId = null; // Son mesaj ID'sini takip etmek için değişken
            let totalDeleted = 0;

            while (true) {
                const fetchedMessages = await dmChannel.messages.fetch({ limit: 100, before: lastMessageId });
                console.log(`Çekilen mesaj sayısı: ${fetchedMessages.size}`); // Çekilen mesaj sayısını konsola yaz

                if (fetchedMessages.size === 0) break; // Eğer mesaj yoksa döngüden çık

                for (const msg of fetchedMessages.values()) {
                    if (msg.author.id === client.user.id) {
                        try {
                            console.log(`Silinen mesaj: ${msg.content}`); // Silinen mesajı konsola yaz
                            await msg.delete();
                            totalDeleted++;
                        } catch (deleteError) {
                            console.error(`Mesaj silinemedi: ${msg.id}`, deleteError);
                        }
                    }
                }

                lastMessageId = fetchedMessages.last()?.id; // Son mesaj ID'sini güncelle
                if (!lastMessageId) break; // Eğer son mesaj ID alınamıyorsa döngüden çık
            }

            message.channel.send(`Kullanıcı ${kullanıcıID} ile olan DM'ler temizlendi. Toplam silinen mesaj sayısı: ${totalDeleted}`);
        } catch (error) {
            if (error.httpStatus === 403) {
                console.log(error)
                message.channel.send('DM mesajlarını silme yetkiniz yok.');
            } else {
                console.error('Hata:', error);
                message.channel.send('Bir hata oluştu. Kullanıcı ID doğru mu kontrol edin.');
            }
        }
    } });
client.login(TOKEN);
