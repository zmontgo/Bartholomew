const starboardActions = require('../eventActions/starboardActions');
const countingActions = require("../eventActions/countingActions");

module.exports = async (client, message, channel) => {
  starboardActions.removeMessage(client, message);
  countingActions.mendBroken(client, message);
};
