const bookmarkActions = require('../eventActions/bookmarkActions');
const starboardActions = require('../eventActions/starboardActions');
const reportActions = require('../eventActions/reportAction');

module.exports = async (client, reaction, user) => {
	// When we receive a reaction we check if the reaction is partial or not, and return because this event will be fired by the raw event
	if (reaction.partial) {
		return;
	}
  
  // Bookmark messages in DMs
  bookmarkActions.bookmarkMessage(user, reaction);
  // Check if message should be added to starboard or if starboard message should be updated
	starboardActions.addStar(client, user, reaction);
	// Check if user is reporting a message
	reportActions.checkReport(client, user, reaction);
};
