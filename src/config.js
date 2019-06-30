// ------------------------------------------------------------------
// APP CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    logging: true,

    intentMap: {
        'AMAZON.StopIntent': 'END',
        'AMAZON.HelpIntent': 'HelpIntent'
    },

    intentsToSkipUnhandled: [
        'END',
        'RepeatIntent'
    ],

    db: {
        FileDb: {
            pathToFile: '../db/db.json',
        }
    },

    user: {
        context: true,
    },
};
