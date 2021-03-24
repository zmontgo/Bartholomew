const welcomeActions = require('../eventActions/welcomeActions');

module.exports = async (client, member) => {
  if(member.user.bot) return;
  
  welcomeActions.dmWelcome(client, member);
};