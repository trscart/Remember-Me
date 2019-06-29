// ------------------------------------------------------------------
// JOVO PROJECT CONFIGURATION
// ------------------------------------------------------------------

module.exports = {
    alexaSkill: {
        nlu: 'alexa',
        manifest: {
          permissions: [
            {
              name: 'alexa::devices:all:geolocation:read'
            }
          ]
        }
      },
    endpoint: '${JOVO_WEBHOOK_URL}',
}