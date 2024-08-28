const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kanal-sil')
    .setDescription('Belirtilen Kategorideki Tüm kanalları siler.')
    .addStringOption(option =>
      option.setName('kategori-sil')
        .setDescription('Silinecek Kategori İd yi yazınız Örnek:1274406563616133212.')
        .setRequired(true)),
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) return;

    const allowedUserIds = ['1186283237778137158', '1031839669844987934'];
    const userId = interaction.user.id;

 
    if (!allowedUserIds.includes(userId)) {
      return interaction.reply({ content: 'Uyarı Geçersiz Veya Yetersiz Yetki.', ephemeral: true });
    }

    const categoryId = interaction.options.getString('kategori-sil');
    const category = guild.channels.cache.get(categoryId);

    if (!category || category.type !== ChannelType.GuildCategory) {
      return interaction.reply({ content: 'Belirtilen kategori ID geçerli değil veya kategori değil.', ephemeral: true });
    }


    await interaction.reply({ content: 'Kanallar siliniyor...', ephemeral: true });

    const channelIds = [];

    try {

      const channels = guild.channels.cache.filter(channel => channel.parentId === categoryId);
      
      for (const channel of channels.values()) {
        try {
          channelIds.push(channel.id); 
          await channel.delete(`Kategori ${category.name} içinde silindi.`);
        } catch (error) {
          console.error(`Kanal silinirken hata oluştu: ${channel.id}`, error);
        }
      }

 
      fs.writeFileSync(path.join(__dirname, 'channelIds.json'), JSON.stringify(channelIds, null, 2));

 
      const embed = new EmbedBuilder()
        .setTitle("ASL BOTS")
        .setURL("https://discord.gg/aslbots") 
        .setDescription("*Log kategorisi ve kanalları Başarıyla Silindi")
        .setColor(0x2e2e70)
        .setImage('https://i.ibb.co/7YHHJPz/aslgif1-min.gif')
        .setTimestamp();


      await interaction.followUp({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Kanallar silinirken hata oluştu:', error);
      await interaction.followUp({ content: 'Kanallar silinirken bir hata oluştu.', ephemeral: true });
    }
  },
};
