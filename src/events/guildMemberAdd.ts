import welcomeActions from "../eventActions/welcomeActions";

export default async (client, member) => {
  if (member.user.bot) return;

  welcomeActions.joinWelcome(client, member);
};
