'use strict';

// ------------------------------------------------------------------
// APP INITIALIZATION
// ------------------------------------------------------------------

const { App } = require('jovo-framework');
const { Alexa } = require('jovo-platform-alexa');
const { JovoDebugger } = require('jovo-plugin-debugger');
const { FileDb } = require('jovo-db-filedb');

const app = new App();

app.use(
    new Alexa(),
    new JovoDebugger(),
    new FileDb()
);


// ------------------------------------------------------------------
// APP LOGIC
// ------------------------------------------------------------------

let user = {
    name: "",
    pills: { active: false, pillsName: []},
    dailyReminder: false,
    exercises: false
}

app.setHandler({

    /* configuration region */

    NEW_USER() {
        console.log('NEW_USER');
        this.ask("Benvenuto in remember me! Con questa skill potrai prenderti cura di chiunque soffra della patologia di Alzheimer. Potrai impostare i promemoria per i farmaci, per controllare e guidare l'assistito nelle sue azioni quotidiane come la cura di se o la preparazione dei pasti. Inoltre saranno disponibili anche dei giochi cognitivi per tenere la memoria sempre in allenamento. Ora configureremo insieme la skill, per prima cosa dimmi come si chiama il l'assistito.")
    },

    LAUNCH() {
        console.log('LAUNCH');
        this.ask("Benvenuto in remember me! Con questa skill potrai prenderti cura di chiunque soffra della patologia di Alzheimer. Potrai impostare i promemoria per i farmaci, per controllare e guidare l'assistito nelle sue azioni quotidiane come la cura di se o la preparazione dei pasti. Inoltre saranno disponibili anche dei giochi cognitivi per tenere la memoria sempre in allenamento. Ora configureremo insieme la skill, per prima cosa dimmi come si chiama il l'assistito.")
        //this.ask("ciao, cosa vuoi fare?")
        //return this.toIntent('AddReminderIntent');
    },

    RepeatIntent() {
        this.repeat();
    },

    async AddReminderIntent() {
        let date = new Date()
        console.log(date.toISOString())
        const reminder = {
            "requestTime": date.toISOString(),
            "trigger": {
                "type": "SCHEDULED_RELATIVE",
                "offsetInSeconds": "5"
            },
            "alertInfo": {
                "spokenInfo": {
                    "content": [{
                        "locale": "it-IT",
                        "text": "prova"
                    }]
                }
            },
            "pushNotification": {
                "status": "ENABLED"
            }
        };

        try {
            const result = await this.$alexaSkill.$user.setReminder(reminder);

            this.tell('Reminder has been set.');

        } catch (error) {
            if (error.code === 'NO_USER_PERMISSION') {
                this.tell('Please grant the permission to set reminders.');
            } else {
                console.error(error);
                // Do something
            }
        }
    },

    NameIntent() {
        console.log(this.$session)
        user.name = this.$inputs.name.value //set user name
        this.$speech.addText("Faccio il mio primo saluto a " + user.name + ". La prima funzionalità che questa skill offre, è la possibilità di ricordare a " + user.name + " di assumere tutti i farmaci che prende durante il giorno. Quindi vorresti attivare questa funzionalità?");
        this.$reprompt.addText('Per favore rispondi si o no');
        this.followUpState('pillsReminderState')
            .ask(this.$speech, this.$reprompt);
    },

    pillsReminderState: {
        YesIntent() {
            user.pills.active = true //set pills reminder on
            console.log("YES" + user.pills.active)
            this.$speech.addText("Bene! Ora imposteremo insieme i promemoria giornalieri per i farmaci. Per prima cosa dovrai dirmi uno alla volta i nomi dei farmaci che " + user.name + " prende durante il giorno. Dopo avermi comunicato il primo nome, dovrai dirmi a che ora del giorno dovrò ricordaglielo e così via per ogni farmaco. Bene iniziamo! Dimmi il nome del primo.");
            this.$reprompt.addText('Per favore elenca le pillole una alla volta');
            this.ask(this.$speech, this.$reprompt);
        },

        PillsNameIntent() {
            user.pills.pillsName.push(this.$inputs.medicine.value) // push medicine name inside pillsName array
            console.log(user.pills.pillsName)
            this.$speech.addText("a che ora del giorno vuoi che gli ricordi questo farmaco?");
            this.$reprompt.addText('Per favore dimmi a che ora del giorno vuoi che glielo ricordi');
            this.ask(this.$speech, this.$reprompt);
        },

        PillsTimeIntent() {
            console.log(this.$inputs)
            this.$speech.addText("Bene! " + user.name + " prende altri farmaci?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('pillsReminderState.pillsState')
                .ask(this.$speech, this.$reprompt);
        },

        pillsState: {
            YesIntent() {
                this.$speech.addText("Allora dimmi il nome del farmaco");
                this.$reprompt.addText('Per favore dimmi il nome del farmaco');
                this.followUpState('pillsReminderState')
                    .ask(this.$speech, this.$reprompt);
            },
            NoIntent() {
                return this.toStateIntent('pillsReminderState', 'NoIntent');
            }
        },

        NoIntent() {
            user.pills.active = false //set pills reminder off
            console.log("NO" + user.pills.active)
            this.$speech.addText("Perfetto abbiamo impostato tutti i promemoria per i farmaci. Da oggi in poi ogni giorno agli orari stabiliti ricorderò a " + user.name + " di prendere le pillole. Ora continuiamo con la configurazione. Vuoi attivare i promemoria giornalieri rigurdanti le azioni che " + user.name + " deve svolgere ogni giorno, come la cura di se e la preparazione dei pasti?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('dailyReminderState')
                .ask(this.$speech, this.$reprompt);
        },
    },

    dailyReminderState: {
        YesIntent() {
            user.dailyReminder = true //set defaultReminder on
            console.log("YES" + user.defaultReminder)
            this.$speech.addText("Bene! ancora un ultimo passo e la configurazione sarà completa. Questa skill ha una sezione dedicata agli esercizi cognitivi, che possono stimolare e tenere in attività " + user.name  + ". Vorresti attivare questa sezione?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('setExercisesState')
                .ask(this.$speech, this.$reprompt);
        },
        NoIntent() {
            user.dailyReminder = false //set defaultReminder off
            console.log("NO" + user.defaultReminder)
            his.$speech.addText("Bene! ancora un ultimo passo e la configurazione sarà completa. Questa skill ha una sezione dedicata agli esercizi cognitivi, che possono stimolare e tenere in attività " + user.name  + ". Vorresti attivare questa sezione?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('setExercisesState')
                .ask(this.$speech, this.$reprompt);
        },
    },

    setExercisesState: {
        YesIntent() {
            user.exercises = true //set exercises on
            console.log("YES" + user.exercises)
            this.tell("Perfetto! Abbiamo completato la configurazione della skill. Per avviarla ti basterà dire Alexa, apri Remember Me, e in caso tu volessi modificare alcune impostazioni, ti basterà avviare la skill e poi dirmi Alexa, voglio modificare le impostazioni. Sarò più che felice di seguire " + user.name + " durante le sue giornate, sono sicura che diventeremo buoni amici. Quando vuoi io sono qui, a presto!")
        },
        NoIntent() {
            user.exercises = false //set exercises off
            console.log("NO" + user.exercises)
            this.tell("Perfetto! Abbiamo completato la configurazione della skill. Per avviarla ti basterà dire Alexa, apri Remember Me, e in caso tu volessi modificare alcune impostazioni, ti basterà avviare la skill e poi dirmi Alexa, voglio modificare le impostazioni. Sarò più che felice di seguire " + user.name + " durante le sue giornate, sono sicura che diventeremo buoni amici. Quando vuoi io sono qui, a presto!")
        },
    },

    /* end configuration region */

    /* exercises region */

    MemoryExercisesIntent() {
        if (user.exercises) {
            this.tell("Attivo gli esercizi per la memoria")
            user.exercises = true
        }
        this.ask("Che esercizio vuoi fare tra spazio temporale, x, y?");
    }

    /* end exercises region */

    /* pills reminder region */



    /* end pills reminder region */

    /* default reminder region */



    /* end default reminder region */
});

module.exports.app = app;
