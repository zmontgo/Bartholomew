import config from "../config";
import { EmbedBuilder } from "discord.js";

export class bookmarkActions {
  static async bookmarkMessage(user, reaction) {
    if (reaction._emoji && reaction._emoji.id === config.emotes.bookmark) {
      const workingMessage = reaction.message;
      const prayEmote = "🙏";
      const bookmarkEmbed = new EmbedBuilder()
        .setColor(config.colors.embedColor)
        .setTitle(`${prayEmote} Prayer Room Server Bookmark ${prayEmote}`)
        .setDescription(
          "You asked to bookmark this post from The Prayer Room server."
        );
      bookmarkEmbed.addFields(
        {
          name: "From",
          value: workingMessage.author,
          inline: true
        },
        {
          name: "Link to Message",
          value: `[Jump to Message](${workingMessage.url})`,
          inline: true
        },
        {
          name: "Channel",
          value: workingMessage.channel,
          inline: false
        }
      )
      const messageChunks = workingMessage.content.match(/[\s\S]{1,1024}/g);

      for (const chunk of messageChunks) {
        bookmarkEmbed.addFields({name: "Full Message", value: chunk, inline: false});
      }

      // Add link to attachment
      if (workingMessage.attachments.array().length > 0) {
        const attachment = workingMessage.attachments.array()[0].url;
        bookmarkEmbed.addFields({name: "Attachment", value: attachment, inline: false});
        bookmarkEmbed.setImage(attachment);
      }

      user.send({ embeds: [bookmarkEmbed] });
    }
  }
}
