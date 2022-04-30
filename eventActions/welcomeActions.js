const Discord = require('discord.js');
const config = require('../config.json');

class welcomeActions {
  static async channelWelcome(client, oldMember, newMember) {
    if (
      newMember.roles.cache.some((role) => role.id === config.roles.member) &&
      !oldMember.roles.cache.some((role) => role.id === config.roles.member)
    ) {
      const reactrole = newMember.guild.roles.cache.find(
        (role) => role.id === config.roles.reactDivider
      );
      const levelrole = newMember.guild.roles.cache.find(
        (role) => role.id === config.roles.rankDivider
      );
      const extrachannels = newMember.guild.roles.cache.find(
        (role) => role.id === config.roles.extraDivider
      );
      try {
        await newMember.roles.add(reactrole);
        await newMember.roles.add(levelrole);
        await newMember.roles.add(extrachannels);
      } catch (err) {
        console.log(err);
      }

      try {
        // Add roles and send welcome message to the welcome channel
        newMember.guild.channels.cache
          .get(config.channels.welcome)
          .send(
            `🎉 **A new member has arrived!** 🎉\nPlease welcome <@${newMember.id}> to the **Prayer Room Discord** <@&${config.roles.welcome}> team!\nWe're so glad you've joined. :blush:`
          )
          .then((message) => {
            message.react(config.emotes.wave);
          });
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async joinWelcome(client, member) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(
        `${member.user.username}#${member.user.discriminator}`,
        member.user.displayAvatarURL()
      )
      .setTitle(`Member Joined`)
      .setDescription(
        `${member.user.username}#${member.user.discriminator} joined the server.`
      )
      .setColor(config.colors.embedColor);
    client.channels.cache.get(config.channels.logs).send(embed);

    let welcomePanel = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle('🙏 __**Welcome to The Prayer Room Discord Server!**__ 🙏')
      .setDescription(
        "**We've set up a short process to protect our community. It's a three-step process that usually takes less than a minute, we look forward to chatting with you!**"
      )
      .addField(
        'Step One',
        'Click the `Complete` button at the bottom of the screen. This will allow you to send messages here and allow you to move on to step two.'
      )
      .addField(
        'Step Two',
        `Then, introduce yourself here! Be sure to mention all of the following:
> • What you'd like to be called.
> • Your age (or whether you're over or under 18).
> • How you found this server.
> • What you hope to get out of the community.`
      )
      .addField(
        'Step Three',
        'Finally, ping the <@&824421461526708304> role to gain the Member role and join the server!'
      );

    return await member.guild.channels.cache
      .get(config.channels.gate)
      .send(`<@!${member.id}>`, {
        embed: welcomePanel,
      });
  }
}

module.exports = welcomeActions;
