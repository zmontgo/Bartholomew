import { welcomeActions } from "../eventActions/welcomeActions";

export = async (client, oldMember, newMember) => {
  if (newMember.user.bot) return;

  welcomeActions.channelWelcome(client, oldMember, newMember);
};
