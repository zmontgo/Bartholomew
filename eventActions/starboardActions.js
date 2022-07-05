const Discord = require('discord.js');
const config = require('../config');
const prisma = require('../utils/database.js');

class starboardActions {
  static async addStar(client, user, reaction) {
    if (
      reaction._emoji &&
      reaction._emoji.name === config.emotes.star &&
      reaction.message.channel.id != config.channels.starchannel
    ) {
      var stars = reaction.count;
      var username = reaction.message.author.username;
      var message = reaction.message.content;
      var avatar = reaction.message.author.displayAvatarURL();
      var link = `https://discordapp.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;

      var att = reaction.message.attachments;

      let result = await prisma.stars.findUnique({ where: { messageid: reaction.message.id} });

      if (result === null) {
        if (reaction.count >= config.min_stars) {
          let starBoardMessage = new Discord.MessageEmbed();
          starBoardMessage.color = config.colors.embedColor;
          starBoardMessage.author = { name: username, url: avatar };
          starBoardMessage.description =
            message + '\n\n**[Click to jump to message.](' + link + ')**';
          starBoardMessage.footer = { text: '⭐ Times starred: ' + stars };

          if (att.size > 0) {
            const att_arr = Array.from(att, ([name, value]) => value);

            starBoardMessage.setImage(att_arr[0].url);
          }

          let channel = await client.channels.cache.get(
            config.channels.starchannel
          );

          channel.send({ embeds: [starBoardMessage] }).then((sentmessage) => {
            let starObject = {
              messageid: reaction.message.id,
              embedid: sentmessage.id,
              messageChannelid: reaction.message.channel.id,
            };

            prisma.stars.create({data: starObject}).then(() => {
              return;
            });
          });
        }
      } else {
        const starchannel = await reaction.message.guild.channels.cache.find(
          (channel) => config.channels.starchannel === channel.id
        );

        starchannel.messages.fetch(result.embedid).then(async (starmessage) => {
          var starmessageEmbed = new Discord.MessageEmbed(starmessage.embeds[0]);
          var times = reaction.count;
          starmessageEmbed.setFooter({text: '⭐ Times starred: ' + times.toString() });
          return await starmessage.edit({ embeds: [starmessageEmbed] });
        });
      }
    }
  }

  static async removeStar(client, user, reaction) {
    if (reaction._emoji && reaction._emoji.name === config.emotes.star) {
      let result = await prisma.stars.findUnique({ where: { messageid: reaction.message.id }});

      if (result !== null) {

        const starchannel = await client.channels.cache
          .get(config.channels.starchannel);

        starchannel.messages.fetch(result.embedid)
          .then(async (starmessage) => {
            if (reaction.count > config.min_stars) {
              var starmessageEmbed = new Discord.MessageEmbed(starmessage.embeds[0]);
              var times = starmessageEmbed.footer.text.substring(
                16,
                starmessageEmbed.footer.text.length
              );
              times = reaction.count;
              starmessageEmbed.setFooter({
                text: '⭐ Times starred: ' + times.toString()
              });
              return await starmessage.edit({ embeds: [starmessageEmbed]});
            } else {
              prisma.stars.delete({ where: { messageid: reaction.message.id } }).then(() => {
                return starmessage.delete();
              });
            }
          });
      }
    }
  }

  static async removeMessage(client, message) {
    let result = await prisma.stars.findUnique({ where: { messageid: message.id }});

    if (result !== null) {
      const starchannel = await client.channels.cache
        .get(config.channels.starchannel);
        
      starchannel.messages.fetch(result.embedid)
        .then((starmessage) => {
          prisma.stars.delete({ where: { messageid: message.id} }).then((_) => {
            return starmessage.delete();
          });
        });
    }

    result = await prisma.stars.findUnique({ where: { embedid: message.id }});

    if (result !== null) {
      prisma.stars.delete({where: { embedid: message.id} }).then(
        client.channels.cache
          .get(result.messageChannelid)
          .messages.fetch(result.messageid)
          .then((starmessage) => {
            starmessage.reactions.removeAll();
          })
      );
    }
  }
}

module.exports = starboardActions;