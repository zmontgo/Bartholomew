const Discord = require('discord.js');
const config = require('../config.json');

module.exports = async (client, oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    const memberrole = newMember.guild.roles.cache.find(role => role.id === config.roles.member);
    const reactrole = newMember.guild.roles.cache.find(role => role.id === config.roles.reactDivider);
    try {
      await newMember.roles.add(memberrole);
      await newMember.roles.add(reactrole);
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
};