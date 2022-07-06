import { starboardActions } from "../eventActions/starboardActions";
import { countingActions } from "../eventActions/countingActions";

export = async (client, message, channel) => {
  starboardActions.removeMessage(client, message);
  countingActions.mendBroken(client, message, "deleted");
};
