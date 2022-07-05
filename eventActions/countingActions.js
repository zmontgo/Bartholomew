const config = require('../config.json');

class countingActions {
  static async checkNumber(client, message) {
    if (message.channel.id === config.channels.counting) {
      // This is not a typo it's a joke. Please leave it.
      const isNumberic = !(isNaN(parseInt(message.content)));
      
      if (isNumberic) message.react("✅");
      else message.react("❌")
    }
  }

  static async getPercentage()
}

module.exports = countingActions;
