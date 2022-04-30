const config = require('../config.json');
const Discord = require('discord.js');

class updateMessageActions {
  static async sendMessageToModeration(client, oldMessage, newMessage) {
    if (oldMessage.channel.id != config.channels.logs) {
      if (oldMessage.embeds.length == 0 && newMessage.embeds.length > 0) return; // Client likely had to fetch an embed from a link
      try {
        const embed = new Discord.MessageEmbed()
          .setAuthor(
            `${newMessage.author.username}#${newMessage.author.discriminator}`,
            newMessage.author.displayAvatarURL()
          )
          .setTitle(`Message Edited`)
          .setDescription(`Message edited in <#${newMessage.channel.id}>.`)
          .addField('Previous Content', oldMessage.content)
          .addField('Current Content', newMessage.content)
          .setColor(config.colors.embedColor);
        client.channels.cache.get(config.channels.logs).send(embed);
      } catch {
        // This will trigger if the message was empty (should be impossible) or if it was an embed, which is possible.
      }
    }
  }
}

module.exports = updateMessageActions;
