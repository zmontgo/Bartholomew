import config from "../config";
import { probeServer } from "../utils/probeServer"

export = (client) => {
  // Set the ready state to true
  probeServer.setReady(true)
  probeServer.verifyLive()
  
  client.user.setActivity(config.playing);
  console.log(
    `Running on ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers.`
  );
};
