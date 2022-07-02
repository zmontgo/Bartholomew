const { MessageEmbed } = require('discord.js');
const { emotes, channels, colors } = require('../config.json');
const prisma = require('../utils/database.js');

class starboardActions {
  static async addStar(client, user, reaction) {
    if (
      reaction._emoji &&
      reaction._emoji.name === emotes.star &&
      reaction.message.channel.id != channels.starchannel
    ) {
      var stars = reaction.count;
      var username = reaction.message.author.username;
      var message = reaction.message.content;
      var avatar = reaction.message.author.displayAvatarURL();
      var link = `https://discordapp.com/channels/${reaction.message.guild.id}/${reaction.message.channel.id}/${reaction.message.id}`;

      var att = reaction.message.attachments;

      let result = await prisma.stars.findUnique({
        where: { messageid: reaction.message.id },
      });

      var embedMessage;
      
      if (result) {
        embedMessage = await client.channels.cache
          .get(channels.starchannel)
          .messages.fetch(result.embedID);
      }

      console.log(embedMessage.content)
      console.log(embedMessage.embeds)

      if (!embedMessage && !embedMessage.content) {
        if (reaction.count >= 1) {
          if (user.id === reaction.message.author.id && reaction.count == 1) {
            await reaction.users.remove(user.id);
            return await reaction.message.channel
              .send(
                ':x: You cannot star your own message until someone else stars it.'
              )
              .then((msg) => msg.delete({ timeout: 5000 }).catch());
          }

          let starBoardMessage = new MessageEmbed()
            .setColor(colors.embedColor)
            .setAuthor(username, avatar)
            .setDescription(
              message + '\n\n**[Click to jump to message.](' + link + ')**'
            )
            .setFooter('⭐ Times starred: ' + stars);

          if (att.array()[0]) {
            att = att.array()[0].url;
            starBoardMessage.setImage(att);
          }

          let channel = await client.channels.cache.get(channels.starchannel);

          channel.send(starBoardMessage).then((sentmessage) => {
            if (!result) {
              let starObject = {
                messageid: reaction.message.id,
                embedid: sentmessage.id,
                messageChannelid: reaction.message.channel.id,
              };

              prisma.stars.create({ data: starObject }).then(() => {
                return;
              })
            } else {
              prisma.stars.update({
                where: { messageid: reaction.message.id },
                data: { embedid: sentmessage.id },
              }).then(() => {
                return;
              })
            }
          });
        }
      } else {
        var starmessageEmbed = embedMessage.embeds[0];
        var times = starmessageEmbed.footer.text.substring(
          16,
          starmessageEmbed.footer.text.length
        );
        times = reaction.count;
        starmessageEmbed.setFooter('⭐ Times starred: ' + times.toString());
        return embedMessage.edit(starmessageEmbed);
      }
    }
  }

  static async removeStar(client, user, reaction) {
    if (reaction._emoji && reaction._emoji.name === emotes.star) {
      let result = await prisma.stars.findUnique({
        where: { messageid: reaction.message.id },
      });

      if (result !== null) {
        client.channels.cache
          .get(channels.starchannel)
          .messages.fetch(result.embedID)
          .then((starmessage) => {
            if (starmessage && starmessage.embeds) {
              if (reaction.count > 0) {
                var starmessageEmbed = starmessage.embeds[0];
                var times = starmessageEmbed.footer.text.substring(
                  16,
                  starmessageEmbed.footer.text.length
                );
                times = reaction.count;
                starmessageEmbed.setFooter(
                  '⭐ Times starred: ' + times.toString()
                );
                return starmessage.edit(starmessageEmbed);
              } else {
                prisma.stars
                  .delete({ where: { messageid: reaction.message.id } })
                  .then(() => {
                    return starmessage.delete();
                  });
              }
            }
          });
      }
    }
  }

  static async removeMessage(client, message) {
    let result = await prisma.stars.findUnique({
      where: { messageid: message.id },
    });

    if (result !== null) {
      client.channels.cache
        .get(channels.starchannel)
        .messages.fetch(result.embedID)
        .then((starmessage) => {
          prisma.stars
            .delete({ where: { messageid: message.id } })
            .then((_) => {
              return starmessage.delete();
            });
        });
    }

    result = await prisma.stars.findUnique({ where: { embedid: message.id } });

    if (result !== null) {
      prisma.stars.delete({ where: { embedid: message.id } }).then(
        client.channels.cache
          .get(result.messageChannelID)
          .messages.fetch(result.messageID)
          .then((starmessage) => {
            starmessage.reactions.removeAll();
          })
      );
    }
  }
}

module.exports = starboardActions;
