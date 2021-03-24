const Discord = require('discord.js');
const config = require('../config.json');

class welcomeActions {
  static async channelWelcome(client, oldMember, newMember) {
    if (oldMember.pending && !newMember.pending) {
      const memberrole = newMember.guild.roles.cache.find(role => role.id === config.roles.member);
      const reactrole = newMember.guild.roles.cache.find(role => role.id === config.roles.reactDivider);
      const levelrole = newMember.guild.roles.cache.find(role => role.id === config.roles.rankDivider);
      try {
        await newMember.roles.add(memberrole);
        await newMember.roles.add(reactrole);
        await newMember.roles.add(levelrole);
      } catch(err) {
        console.log(err);
      }

      try {
        // Add roles and send welcome message to the welcome channel
        newMember.guild.channels.cache
          .get(config.channels.welcome)
          .send(
            `🎉 **A new member has arrived!** 🎉\nPlease welcome <@${newMember.id}> to the **Prayer Room Discord** <@&${config.roles.welcome}> team!\nWe're so glad you've joined. :blush: **Introduce yourself here!** Please include what you'd like to be called, your age (or whether you're below 18 years old or not), how you found the server, and a little about yourself.`
          )
          .then((message) => {
            message.react(config.emotes.wave);
          });
      } catch (err) {
        console.error(err);
      }
    }
  }

  static async dmWelcome(client, member) {
    const embed = new Discord.MessageEmbed()
      .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.displayAvatarURL())
      .setTitle(`Member Joined`)
      .setDescription(`${member.user.username}#${member.user.discriminator} joined the server.`)
      .setColor(config.colors.embedColor);
    client.channels.cache.get(config.channels.logs).send(embed);

    let welcomeDM = new Discord.MessageEmbed()
      .setColor(config.colors.embedColor)
      .setTitle(':books: __**Welcome to The Prayer Room Discord Server!**__ :books:')
      .setDescription('**This has some important information, and we suggest reading through it. It should take less than a minute.**')
      .addField(
        'Gain Access',
        'If you haven\'t already, be sure to verify your email and read the rules. You can find the rules popup by clicking the `Complete` button to the right of the message bar on the bottom.'
      )
      .addField(
        'Handy Dandy Channels',
        `• You can grab some roles in <#765264740342693908>.
    • Say hey in <#765304580161404938>.
    • To learn more about the server, check out <#765303928786387043>.`
      )
      .addField(
        'About The Prayer Room Discord Server',
        `Welcome to The Prayer Room, a Christian community dedicated to fellowship with God and with others. All are welcome, regardless of whether you are a Christian or simply interested in learning about Christianity.`,
        true
      )
      .addField(
        'Safe Space',
        `The Prayer Room server is a safe space. We do not allow prejudice or hatred for anyone, explicit discussions, or offensive speech.`,
        true
      )
      .addField(
        'About Me',
        `I'm Bartholomew, a custom bot made for The Prayer Room server! My feature set is always growing. Use \`.help\` in <#765230530434170940> for more on what I can do.`
      )
      .addField(
        'Spread the Word',
        `If you like The Prayer Room server and want to share us with your friends, here's a permanent invite link: https://discord.gg/xMGTsRR.`,
        true
      );
    member.send(welcomeDM).catch((err) => {
      if (err.name == "DiscordAPIError") {
        welcomeDM.addField(
          'Note',
          'This was sent in this channel, likely because you have disabled DMs from servers. This will be automatically deleted after one minute.'
        );

        return member.guild.channels.cache.get(config.channels.welcome)
        .send(welcomeDM).then(msg => {
          msg.delete({timeout: 600000});
        }).catch(err => {
          console.log(err);
        });
      }

      console.log(err);
    });
  }
}


module.exports = welcomeActions;