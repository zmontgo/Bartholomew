const Discord = require('discord.js');
const config = require('../config.json');

class announcementActions {
  static async checkBoosted(client, oldMember, newMember) {
    if (oldMember.premiumSince === null && newMember.premiumSince !== null) {
    }
  }
}

module.exports = announcementActions;
