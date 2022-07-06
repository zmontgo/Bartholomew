import config from "../config";

const reactions = config.channelReacts;

class reactionCheckAction {
  static async checkIfCorrect(message) {
    for (var i = 0; i < reactions.length; i++) {
      var obj = reactions[i];
      try {
        if (message.channel.id === obj.channel) {
          message.react(obj.react);
        }
      } catch (err) {
        console.log("Error with reaction." + err);
      }
    }
  }
}

export default reactionCheckAction;
