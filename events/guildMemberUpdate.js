const Discord = require('discord.js');
const config = require('../config.json');

module.exports = async (client, oldMember, newMember) => {
  if (oldMember.pending && !newMember.pending) {
    const memberrole = newMember.guild.roles.cache.find(role => role.id === '819708431451684894');
    try {
      await newMember.roles.add(memberrole);
    } catch(err) {
      console.log(err);
    }

    try {
      // Add roles and send welcome message to the welcome channel
      newMember.guild.channels.cache
        .get(config.channels.welcome)
        .send(
          `🎉 **A new member has arrived!** 🎉\nPlease welcome <@${newMember.id}> to the **Prayer Room Discord** <@&765304484649762827> team!\nWe're so glad you've joined. :blush:`
        )
        .then((message) => {
          message.react(config.emotes.wave);
        });
    } catch (err) {
      console.error(err);
    }
  }
};