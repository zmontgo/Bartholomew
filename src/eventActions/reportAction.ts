// Get the afk Table stored in the SQLite database
import config from "../config";
import { EmbedBuilder } from "discord.js";

export class backspeakCheckAction {
  static async checkReport(client, user, reaction) {
    var message = reaction.message;

    try {
      if (reaction._emoji && reaction._emoji.id === config.emotes.report) {
        await reaction.users.remove(user.id);
        var channel = client.channels.cache.get(message.channel.id);
        let starBoardMessage = new EmbedBuilder()
          .setColor(config.colors.embedColor)
          .setAuthor({
            name: `${message.author.username}#${message.author.discriminator}`,
            iconURL: message.author.displayAvatarURL()
          })
          .setDescription(message.content)
          .setFooter({ text: `Reported in #${channel.name}` })
          .setTimestamp(message.createdAt);
        client.channels.cache
          .get(config.channels.reportchannel)
          .send(starBoardMessage)
          .then(() => {
            user.send(":white_check_mark: Reported to staff.");
          });
      }
    } catch (err) {
      user.send(
        ":x: Error when reporting to staff. Please take a screenshot of the message and DM a staff member."
      );
      let errorMessage = new EmbedBuilder()
        .setColor(config.colors.embedColor)
        .setTitle(`Fatal Error`)
        .setDescription(
          `Fatal error has been found when trying to report a message. Error: \`${err}\`.`
        )
        .setFooter({ text: `Action in #${channel.name}` })
        .setTimestamp(message.createdAt);
      message.guild.channels.cache
        .get(config.channels.logs)
        .send({ embeds: [errorMessage] });
    }
  }
}
