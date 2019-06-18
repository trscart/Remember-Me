// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    alexaSkill: {
        nlu: 'alexa',
        manifest: {
            permissions: [
                {
                    name: 'alexa::alerts:reminders:skill:readwrite',
                }
            ]
        }
    },
    endpoint: '${JOVO_WEBHOOK_URL}',
}