const welcomeActions = require('../eventActions/welcomeActions');
const announcementActions = require('../eventActions/announcementActions');

module.exports = async (client, oldMember, newMember) => {
  if(newMember.user.bot) return;

  welcomeActions.channelWelcome(client, oldMember, newMember);
};