const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('log-kurulum')
    .setDescription('Log kanallarını Başarılı Bir Şekilde Oluşturur.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), 
  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) return;

    try {

      await interaction.deferReply();

  
      const categoryName = "ASL Bot's </> Log's";

   
      let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);

      if (category) {
 
        const existingLogChannels = category.children.cache.some(c => c.name.startsWith('🌐│'));
        if (existingLogChannels) {
       
          const user = interaction.user;
          const embed = new EmbedBuilder()
            .setTitle("ASL BOTS")
            .setDescription("<a:unlemsel:1233294336184160327> *Log Kanalları Zaten Kurulu*.")
            .setURL("https://discord.gg/aslbots") 
            .setColor(0x00008B) 
            .setTimestamp()
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 })) 
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) });
          // Yanıtı herkese göster
          return await interaction.editReply({ embeds: [embed] });
        }
      } else {
        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
          reason: 'Log kanalları için kategori oluşturuldu',
        });
      }

 
      const adminRole = guild.roles.cache.find(role => role.permissions.has(PermissionFlagsBits.Administrator));
      if (!adminRole) {
        throw new Error("Yönetici rolü bulunamadı.");
      }

     
      const permissions = [
        {
          id: guild.roles.everyone.id, 
          deny: [PermissionFlagsBits.ViewChannel], 
        },
        {
          id: adminRole.id, 
          allow: [PermissionFlagsBits.ViewChannel], 
        }
      ];


      const logChannels = [
        { name: '🌐│ ᴡᴇʟᴄᴏᴍᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʙʏ ʟᴏɢ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʀᴏʟ-ᴀᴄᴍᴀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʀᴏʟ-ꜱıʟᴍᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʀᴏʟ-ᴜᴘᴅᴀᴛᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʏᴀꜱᴀᴋʟᴀᴍᴀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʏᴀꜱᴀᴋ-ᴋᴀʟᴅıʀᴍᴀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ᴋᴀɴᴀʟ-ᴀᴄᴍᴀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ᴋᴀɴᴀʟ-ꜱıʟᴍᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ᴋᴀɴᴀʟ-ᴜᴘᴅᴀᴛᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ꜱᴜᴘʜᴇʟıʟᴇʀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ᴍᴇꜱᴀᴊ-ꜱıʟᴍᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ꜱᴇꜱ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʀᴏʟ-ᴠᴇʀᴍᴇ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' },
        { name: '🌐│ ʀᴏʟ-ᴀʟᴍᴀ', type: ChannelType.GuildText, topic: 'ᴀꜱʟ ʙᴏᴛꜱ' }
      ];

      const channelIds = {};

      for (const channel of logChannels) {

        const existingChannel = guild.channels.cache.find(c => c.name === channel.name && c.parentId === category.id);
        if (!existingChannel) {
          const createdChannel = await guild.channels.create({
            ...channel,
            parent: category.id,
            reason: `${channel.name} kanalı oluşturuldu`,
            permissionOverwrites: permissions
          });
          channelIds[channel.name] = createdChannel.id;
        } else {
          channelIds[channel.name] = existingChannel.id;
        }
      }


      fs.writeFileSync(path.join(__dirname, 'channelIds.json'), JSON.stringify(channelIds, null, 2));

  
      const embed = new EmbedBuilder()
        .setTitle("ASL BOTS")
        .setURL("https://discord.gg/aslbots") 
        .setDescription("Log kategorisi ve kanalları başarıyla oluşturuldu!")
        .setColor(0x2e2e70)
        .setImage('https://i.ibb.co/7YHHJPz/aslgif1-min.gif')
        .setTimestamp();


      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Kanal oluşturulurken hata oluştu:', error);
      try {
        if (!interaction.replied) {
          await interaction.editReply({ content: 'Kanal oluşturulurken bir hata oluştu.' });
        }
      } catch (replyError) {
        console.error('Yanıt gönderme sırasında hata oluştu:', replyError);
      }
    }
  },
};
