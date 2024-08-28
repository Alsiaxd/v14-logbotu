    const { Client, Events, GatewayIntentBits, ActivityType, REST, Routes, Collection } = require('discord.js');
    const canvafy = require('canvafy'); 
    const path = require('path');
    const fs = require('fs');
    const { EmbedBuilder } = require('discord.js');
    const { AuditLogEvent } = require('discord.js');
    const { ChannelType } = require('discord.js');
    const moment = require('moment'); 
    const config = require('./config.json'); 
    require('dotenv').config(); 

    moment.locale('tr');

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });

    const token = '';

    client.on(Events.MessageCreate, async message => {
      
      if (message.content.startsWith('!log')) {
        try {
          const channelIds = JSON.parse(fs.readFileSync(path.join(__dirname, 'channelIds.json')));
          const channelName = message.content.split(' ')[1]; 
          const channelId = channelIds[channelName];
    
          if (channelId) {
            const channel = await client.channels.fetch(channelId);
            await channel.send(`Yeni log: ${message.content}`);
          }
        } catch (error) {
          console.error('Log gönderme sırasında hata oluştu:', error);
        }
      }
    });
    


  client.commands = new Collection();


  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
  }


const activities = [
  { type: ActivityType.Watching, name: "ASL Bot's" },
  { type: ActivityType.Listening, name: "Müşterilerimiz İle İlgileniyor" },
  { type: ActivityType.Playing, name: "ASL Bot's" },
];


client.once('ready', () => {
  console.log(`Bot ${client.user.tag} olarak giriş yaptı.`);


  let activityIndex = 0;

  setInterval(() => {
    const activity = activities[activityIndex];
    client.user.setPresence({
      activities: [{ name: activity.name, type: activity.type }],
      status: 'online',
    });

    activityIndex = (activityIndex + 1) % activities.length; 
  }, 10 * 60 * 1000); 
});



  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  (async () => {
    try {
      console.log('Komutlar yükleniyor...');

      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: client.commands.map(command => command.data.toJSON()),
      });

      console.log('Komutlar yüklendi!');
    } catch (error) {
      console.error(error);
    }
  })();



  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (client.commands.has(commandName)) {
      const command = client.commands.get(commandName);
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error('Komut çalıştırılırken bir hata oluştu:', error);
        await interaction.reply({ content: 'Bir hata oluştu!', ephemeral: true });
      }
    }
  });


    client.on(Events.ChannelCreate, async (channel) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.CHANNEL_CREATE);
      if (logChannel) {
        try {
          const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate });
          const entry = auditLogs.entries.first();

          const embed = new EmbedBuilder()
            .setTitle('**ᴋᴀɴᴀʟ ᴏʟᴜꜱ̧ᴛᴜʀᴜʟᴅᴜ**')
            .setColor('#060c7f')
            .setDescription(`
              <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** \`${channel.name}\` adlı kanal oluşturuldu.

              **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

              **<a:5961darkbluetea:1233279709026975756> ・ \`ᴋᴀɴᴀʟ ɪsᴍɪ\`:** <#${channel.id}>

              **<:5013bughunterpurple:1233279705994498088> ・ \`ᴋᴀɴᴀʟ ᴛᴜʀᴜ:\`** ${channel.type === 0 ? 'Metin Kanalı' : 'Sesli Kanal'}

              **<a:mcsaat:1233283897660411964> ・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

              **ᴋᴀɴᴀʟ ɪᴅ:** \`${channel.id}\`
            `)
            .setThumbnail(entry.executor.displayAvatarURL())
            .setFooter({ text: 'Kanal oluşturma bilgisi', iconURL: client.user.displayAvatarURL() });
          logChannel.send({ embeds: [embed] });
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });


  client.on(Events.ChannelUpdate, async (oldChannel, newChannel) => {
    const logChannel = client.channels.cache.get(config.CHANNEL_IDS.CHANNEL_UPDATE);
    if (logChannel) {
      try {
        const auditLogs = await oldChannel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelUpdate });
        const entry = auditLogs.entries.first();

        const embed = new EmbedBuilder()
        .setTitle('Kanal Güncellendi')
        .setColor('#2e2e70')
        .setDescription(`<a:unlemsel:1233294336184160327> Bir yetkili tarafından  tarafından \n**\`${oldChannel.name}\`** adlı kanalın ismi güncellendi.`)
        .addFields(
          { name: '<:5013bughunterpurple:1233279705994498088> ᴋᴀɴᴀʟ', value: `<#${oldChannel.id}>` },
          { name: '<:king_crown:1233294287282765865> ʏᴇᴛᴋɪʟɪ', value: `<@${entry.executor.id}>` },
          { name: '\`ᴇsᴋɪ ɪsᴍɪ\`', value: `\`\`\`diff\n- ${oldChannel.name}\`\`\`` },
          { name: '\`ʏᴇɴɪ ɪsᴍɪ\`', value: `\`\`\`fix\n+ ${newChannel.name}\`\`\`` },
          { name: '<a:mcsaat:1233283897660411964> \`ᴛᴀʀɪʜ\`', value: new Date().toLocaleString() }
        )
        .setThumbnail(entry.executor.displayAvatarURL())
      logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Audit Log alınırken hata oluştu:', error);
    }
  }
  });

    client.on(Events.GuildRoleCreate, async (role) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.ROLE_CREATE);
      if (logChannel) {
        try {
          const auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate });
          const entry = auditLogs.entries.first();

          const embed = new EmbedBuilder()
            .setTitle('**ᴏʟᴜꜱ̧ᴛᴜʀᴜʟᴀɴ ʏᴇɴɪ ʀᴏʟ**')
            .setColor('#060c7f')
            .setDescription(`
              <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** \`${role.name}\` adlı rol oluşturuldu.

              **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

              **<a:5961darkbluetea:1233279709026975756> ・ \`ʀᴏʟ ɪsᴍɪ\`:** <@&${role.id}>

              **<a:mcsaat:1233283897660411964> ・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

              **ʀᴏʟ ɪᴅ:** \`${role.id}\`
            `)
            .setThumbnail(entry.executor.displayAvatarURL())
            .setFooter({ text: 'Rol oluşturma bilgisi', iconURL: client.user.displayAvatarURL() });
          await logChannel.send({ embeds: [embed] });
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });



  client.on(Events.ChannelDelete, async (channel) => {
    const logChannel = client.channels.cache.get(config.CHANNEL_IDS.CHANNEL_DELETE);
    if (logChannel) {
      try {
        const auditLogs = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelDelete });
        const entry = auditLogs.entries.first();

        const embed = new EmbedBuilder()
          .setTitle('**ᴋᴀɴᴀʟ sɪʟɪɴᴅɪ**')
          .setColor('#2e2e70')
          .setDescription(`
            <a:unlemsel:1233294336184160327> **Bir yetkili tarafından \`${channel.name}\` adlı kanal silindi.**

            **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

            **<a:5961darkbluetea:1233279709026975756>・ \`ᴋᴀɴᴀʟ ɪsᴍɪ\`:** <#${channel.id}>

            **<:5013bughunterpurple:1233279705994498088>・ \`ᴋᴀɴᴀʟ ᴛᴜʀᴜ:\`** ${channel.type === 0 ? 'Metin Kanalı' : 'Sesli Kanal'}

            **<a:mcsaat:1233283897660411964>・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

            **ᴋᴀɴᴀʟ ɪᴅ:** \`${channel.id}\`
          `)
          .setThumbnail(entry.executor.displayAvatarURL())
          .setFooter({ text: 'Kanal silme bilgisi', iconURL: client.user.displayAvatarURL() })
          .setImage('https://your-image-url.com/your-image.png'); 

        logChannel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Audit Log alınırken hata oluştu:', error);
      }
    }
  });



    client.on(Events.GuildRoleDelete, async (role) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.ROLE_DELETE);
      if (logChannel) {
        try {
          const auditLogs = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete });
          const entry = auditLogs.entries.first();

          const embed = new EmbedBuilder()
            .setTitle('**ʀᴏʟ sɪʟɪɴᴅɪ**')
            .setColor('#2e2e70')
            .setDescription(`
              <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** \`${role.name}\` adlı rol silindi.

              **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

              **<a:mcsaat:1233283897660411964> ・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

              **ʀᴏʟ ɪᴅ:** \`${role.id}\`
            `)
            .setThumbnail(entry.executor.displayAvatarURL())
            .setFooter({ text: 'Rol silme bilgisi', iconURL: client.user.displayAvatarURL() });
          await logChannel.send({ embeds: [embed] });
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });


    client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.VOICE);
      if (!logChannel) {
          console.error('Log kanalı bulunamadı.');
          return;
      }

      const username = newState.member.user.username;
      const userTag = newState.member.user.tag;
      const userId = newState.member.user.id;
      const timestamp = moment().format('DD MMMM YYYY HH:mm');

      let embed = new EmbedBuilder()
          .setAuthor({ name: username, iconURL: newState.member.user.displayAvatarURL() })
          .setTimestamp()
          .setColor("#2e2e70");

      if (!oldState.channel && newState.channel) {
 
          embed
              .setTitle('ɢɪʀɪꜱ')
              .setDescription(`<:8676gasp:1233279834600378441>・ \`ᴋᴜʟʟᴀɴɪᴄɪ:\` <@${userId}> - \`${userId}\`\n**<:2124discordstagechannel:1233279436825296987>・ꜱᴇꜱ ᴋᴀɴᴀʟɪ:**  <#${newState.channel.id}>`)
              .setFooter({ text: `${timestamp}` });
      } else if (oldState.channel && !newState.channel) {
      
          embed
              .setTitle('ᴄɪᴋɪꜱ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**ꜱᴇꜱ ᴋᴀɴᴀʟɪ:** <:ses:1234567890> <#${oldState.channel.id}>`)
              .setFooter({ text: `${timestamp}` });
      } else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
          
          embed
              .setTitle('ᴋᴀɴᴀʟ ᴅᴇɪşɪᴍɪ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**ᴇsᴋɪ ᴋᴀɴᴀʟ:** <:ses:1234567890> <#${oldState.channel.id}>\n**ʏᴇɴɪ ᴋᴀɴᴀʟ:** <:ses:1234567890> <#${newState.channel.id}>`)
              .setFooter({ text: `${timestamp}` });
      } else if (!oldState.serverMute && newState.serverMute) {
     
          embed
              .setTitle('sᴜsᴛᴜʀᴍᴀ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**ꜱᴜsᴛᴜʀᴀɴ:** ${userTag}`)
              .setFooter({ text: `${timestamp}` });
      } else if (oldState.serverMute && !newState.serverMute) {
         
          embed
              .setTitle('sᴜsᴛᴜʀᴍᴀ ᴋᴀʟᴅɪʀɪʟᴅɪ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**ꜱᴜsᴛᴜʀᴜʟᴍᴀ:** ${userTag}`)
              .setFooter({ text: `${timestamp}` });
      } else if (!oldState.serverDeaf && newState.serverDeaf) {
     
          embed
              .setTitle('sᴀɪʀʟᴀsᴛɪʀᴍᴀ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**sᴀɪʀʟᴀsᴛɪʀᴍᴀ:** ${userTag}`)
              .setFooter({ text: `${timestamp}` });
      } else if (oldState.serverDeaf && !newState.serverDeaf) {
       
          embed
              .setTitle('sᴀɪʀʟᴀsᴛɪʀᴍᴀ ᴋᴀʟᴅɪʀɪʟᴅɪ')
              .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\n**sᴀɪʀʟᴀsᴛɪʀᴜʟᴍᴀ:** ${userTag}`)
              .setFooter({ text: `${timestamp}` });
      } else if (oldState.streaming !== newState.streaming) {
          if (newState.streaming) {
        
              embed
                  .setTitle('ʏᴀʏɪɴ ʙᴀşʟᴀᴛıʟᴅı')
                  .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\nYayın başlattı.`)
                  .setFooter({ text: `${timestamp}` });
          } else {
            
              embed
                  .setTitle('ʏᴀʏɪɴ ᴅᴜʀᴅᴜʀᴜʟᴅᴜ')
                  .setDescription(`**ᴋᴜʟʟᴀɴɪᴄɪ:** <@${userId}> - \`${userId}\`\nYayını durdurdu.`)
                  .setFooter({ text: `${timestamp}` });
          }
      }

      logChannel.send({ embeds: [embed] });
  });


    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.ROLE_UPDATE);
      if (logChannel) {
        try {
    
          const auditLogs = await oldRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate });
      
          const entry = auditLogs.entries.find(e => e.target.id === oldRole.id);

     
          if (entry) {
            const embed = new EmbedBuilder()
              .setTitle('**ʀᴏʟ ɢᴜ̈ɴᴄᴇʟʟᴇɴᴅɪ**')
              .setColor('#2e2e70')
              .setDescription(`
                <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** \`${oldRole.name}\` adlı rol güncellendi.

                **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

                **<a:5013bughunterpurple:1233279705994498088> ᴇsᴋɪ ʀᴏʟ ɪsᴍɪ\`:** \`\`\`diff\n- ${oldRole.name}\`\`\`

                **<a:5013bughunterpurple:1233279705994498088> ʏᴇɴɪ ʀᴏʟ ɪsᴍɪ\`:** \`\`\`fix\n+ ${newRole.name}\`\`\`

                **<a:mcsaat:1233283897660411964> ・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

                **ʀᴏʟ ɪᴅ:** \`${oldRole.id}\`
              `)
              .setThumbnail(entry.executor.displayAvatarURL())
              .setFooter({ text: 'Rol güncelleme bilgisi', iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
          } else {
            console.warn('Güncellenen rol için uygun bir audit log girişi bulunamadı.');
          }
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });


    client.on(Events.GuildRoleUpdate, async (oldRole, newRole) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.ROLE_UPDATE);
      if (logChannel) {
 
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
          try {
            const auditLogs = await oldRole.guild.fetchAuditLogs({ type: AuditLogEvent.RoleUpdate });
            const entry = auditLogs.entries.find(e => e.target.id === oldRole.id);

            const addedPermissions = newRole.permissions.toArray().filter(perm => !oldRole.permissions.has(perm));
            const removedPermissions = oldRole.permissions.toArray().filter(perm => !newRole.permissions.has(perm));

            const embed = new EmbedBuilder()
              .setTitle('**ʀᴏʟ ɪᴢɪɴʟᴇʀɪ ɢᴜ̈ɴᴄᴇʟʟᴇɴᴅɪ**')
              .setColor('#ffcc00')
              .setDescription(`
                <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** \`${oldRole.name}\` adlı rolün izinleri güncellendi.

                **<:king_crown:1233294287282765865>・ \`ʏᴇᴛᴋɪʟɪ:\`** <@${entry.executor.id}>

                ${addedPermissions.length > 0 ? `**Eklenen İzinler:**\n\`\`\`diff\n+ ${addedPermissions.join('\n+ ')}\`\`\`` : ''}

                ${removedPermissions.length > 0 ? `**Kaldırılan İzinler:**\n\`\`\`diff\n- ${removedPermissions.join('\n- ')}\`\`\`` : ''}

                **<a:mcsaat:1233283897660411964> ・ \`ᴛᴀʀɪʜ:\`** ${new Date().toLocaleString()}

                **ʀᴏʟ ɪᴅ:** \`${oldRole.id}\`
              `)
              .setThumbnail(entry.executor.displayAvatarURL())
              .setFooter({ text: 'Rol izinleri güncelleme bilgisi', iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
          } catch (error) {
            console.error('Audit Log alınırken hata oluştu:', error);
          }
        }
      }
    });


    client.on(Events.GuildBanAdd, async (ban) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.BAN_LOG);
      if (logChannel) {
        try {
          const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd });
          const entry = auditLogs.entries.find(e => e.target.id === ban.user.id);

          if (entry) {
            const embed = new EmbedBuilder()
              .setTitle('**Kullanıcı Banlandı**')
              .setColor('#ff0000')
              .setDescription(`
                <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** <@${ban.user.id}> adlı kullanıcı banlandı.

                **<:king_crown:1233294287282765865>・ \`Yetkili:\`** <@${entry.executor.id}>

                **<a:mcsaat:1233283897660411964> ・ \`Tarih:\`** ${new Date().toLocaleString()}

                **Kullanıcı ID:** \`${ban.user.id}\`
              `)
              .setThumbnail(ban.user.displayAvatarURL())
              .setFooter({ text: 'Kullanıcı banlama bilgisi', iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
          } else {
            console.warn('Ban için uygun bir audit log girişi bulunamadı.');
          }
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });


    client.on(Events.GuildBanRemove, async (ban) => {
      const logChannel = client.channels.cache.get(config.CHANNEL_IDS.UNBAN_LOG);
      if (logChannel) {
        try {
          const auditLogs = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove });
          const entry = auditLogs.entries.find(e => e.target.id === ban.user.id);

          if (entry) {
            const embed = new EmbedBuilder()
              .setTitle('**Kullanıcı Unbanlandı**')
              .setColor('#00ff00')
              .setDescription(`
                <a:unlemsel:1233294336184160327> **Bir yetkili tarafından** <@${ban.user.id}> adlı kullanıcının yasağı kaldırıldı.

                **<:king_crown:1233294287282765865>・ \`Yetkili:\`** <@${entry.executor.id}>

                **<a:mcsaat:1233283897660411964> ・ \`Tarih:\`** ${new Date().toLocaleString()}

                **Kullanıcı ID:** \`${ban.user.id}\`
              `)
              .setThumbnail(ban.user.displayAvatarURL())
              .setFooter({ text: 'Kullanıcı unbanlama bilgisi', iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
          } else {
            console.warn('Unban için uygun bir audit log girişi bulunamadı.');
          }
        } catch (error) {
          console.error('Audit Log alınırken hata oluştu:', error);
        }
      }
    });

    client.on('guildMemberAdd', async (member) => {
      try {
        const guild = member.guild;
    
  
        const totalMembers = guild.memberCount;
    
      
        const allMembers = await guild.members.fetch();
      
        const memberIndex = allMembers.size; 
    
       
        let platform = 'Bilinmiyor';
        const presence = member.presence ? member.presence.status : 'offline'; 
    
        if (presence === 'online') {
          const clientStatus = member.presence.clientStatus || {}; 
          if (clientStatus.desktop) {
            platform = 'Bilgisayar';
          } else if (clientStatus.mobile) {
            platform = 'Telefon';
          } else if (clientStatus.web) {
            platform = 'Web';
          }
        } else if (presence === 'dnd') {
          const clientStatus = member.presence.clientStatus || {}; 
          if (clientStatus.desktop) {
            platform = 'Bilgisayar';
          } else if (clientStatus.mobile) {
            platform = 'Telefon';
          } else if (clientStatus.web) {
            platform = 'Web';
          }    } else {
          platform = 'Çevrim Dışı'; 
        }
    
   
        const welcome1 = await new canvafy.WelcomeLeave()
          .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: "png" })) 
          .setBackground("image", "https://i.ibb.co/jwVytw7/als2.png") 
          .setTitle(member.user.username) 
          .setDescription("Welcome This ASL BOTS") 
          .setBorder("#2e2e70") 
          .setAvatarBorder("#141212") 
          .setOverlayOpacity(0.6) 
          .build(); 
    
 
        const logChannel = guild.channels.cache.get('1275526731679268978');
    
        if (!logChannel) {
          console.error('Log kanalı bulunamadı.');
          return;
        }
    
   
        await logChannel.send({ 
          content: `** <a:devil:1233284231376142399>・Sunucuya Giriş Yaptı:** <@${member.id}>\n**<a:cute:1233284229563940916>・Platformu:** \`${platform}\` \n** <a:poofpinkheart:1233294316945014855>・\`Seninle Birlikte:\`** ${memberIndex}/${totalMembers}`,
          files: [{
            attachment: welcome1,
            name: `saviour-${member.id}.png`
          }]
        });
    
        const logChannel2 = member.guild.channels.cache.get('1275526731679268978');
            const security = await new canvafy.Security()
                .setAvatar(member.user.displayAvatarURL({ extension: "png", forceStatic: true }))
                .setBackground("image", `https://i.ibb.co/jwVytw7/als2.png`).setCreatedTimestamp(member.user.createdTimestamp)
                .setSuspectTimestamp(10368000000) 
                .setBorder("#f0f0f0")
                .setLocale("tr") 
                .setAvatarBorder("#f0f0f0")
                .setOverlayOpacity(0.9)
                .build();
    
            logChannel2.send({
                content: `🔍・Güvenlik Kontrolü: ${member}`,
                files: [{
                    attachment: security,
                    name: `security-${member.id}.png`
                }]
            });
    
      } catch (error) {
        console.error(`Bir hata oluştu: ${error}`);
      }
    });
    
    
    client.on('guildMemberRemove', async (member) => {
      try {
        const guild = member.guild;
        const logChannel = guild.channels.cache.get('1275526716449755354');
        if (!logChannel) {
          console.error('Log kanalı bulunamadı.');
          return;
        }
    

        let platform = 'Bilinmiyor';
        const presence = member.presence ? member.presence.status : 'offline';
    
        if (presence === 'online') {
          const clientStatus = member.presence.clientStatus || {};
          if (clientStatus.desktop) {
            platform = 'Bilgisayar';
          } else if (clientStatus.mobile) {
            platform = 'Telefon';
          } else if (clientStatus.web) {
            platform = 'Web';
          }
        } else if (presence === 'dnd') {
          const clientStatus = member.presence.clientStatus || {};
          if (clientStatus.desktop) {
            platform = 'Bilgisayar';
          } else if (clientStatus.mobile) {
            platform = 'Telefon';
          } else if (clientStatus.web) {
            platform = 'Web';
          }
        } else {
          platform = 'Çevrim Dışı';
        }
    
        const exitTime = moment(Date.now()).format('DD MMMM YYYY HH:mm');
    
        const leaveImage = await new canvafy.WelcomeLeave()
          .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
          .setBackground('image', 'https://i.ibb.co/jwVytw7/als2.png')
          .setTitle(member.user.username)
          .setDescription(`Çıkış Tarihi: ${exitTime}`)
          .setBorder('#2e2e70')
          .setAvatarBorder('#141212')
          .setOverlayOpacity(0.6)
          .build();
    
        await logChannel.send({
          content: `<a:devil:1233284231376142399> ・ \`Sunucudan Çıkış Yaptı:\` ${member}\n**<a:cute:1233284229563940916> ・ Platformu:** \`${platform}\``,
          files: [{
            attachment: leaveImage,
            name: `exit-${member.id}.png`
          }]
        });
      } catch (error) {
        console.error(`Bir hata oluştu: ${error}`);
      }
    });

    
    
    client.login(process.env.BOT_TOKEN);
