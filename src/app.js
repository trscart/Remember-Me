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
    name: "Umberto",
    pills: { active: false, pillsName: [] },
    dailyReminder: false,
    exercises: false
}

// exercise counter
let intruderExerciseCount = 0
let whereAmIExerciseCount = 0
let skillCount = 0

app.setHandler({

    /* configuration region */

    NEW_USER() {
        console.log('NEW_USER');
        //this.ask("Benvenuto in remember me! Con questa skill potrai prenderti cura di chiunque soffra della patologia di Alzheimer. Potrai impostare i promemoria per i farmaci, per controllare e guidare l'assistito nelle sue azioni quotidiane come la cura di se o la preparazione dei pasti. Inoltre saranno disponibili anche dei giochi cognitivi per tenere la memoria sempre in allenamento. Ora configureremo insieme la skill, per prima cosa dimmi come si chiama il l'assistito.")
    },

    LAUNCH() {
        console.log('LAUNCH ' + skillCount);
        if (skillCount == 0) {
            this.$speech.addText("Benvenuto in remember me! Con questa skill potrai prenderti cura di chiunque soffra della patologia di Alzheimer. Potrai impostare i promemoria per i farmaci, per controllare e guidare l'assistito nelle sue azioni quotidiane come la cura di se o la preparazione dei pasti. Inoltre saranno disponibili anche dei giochi cognitivi per tenere la memoria sempre in allenamento. Ora configureremo insieme la skill, per prima cosa dimmi come si chiama il l'assistito.");
            this.followUpState('nameState')
                .ask(this.$speech);
            skillCount = 1
        } else {
            this.$speech.addText("Bentornato " + user.name + "! Vuoi fare qualche esercizio per la memoria?")
            this.followUpState('exerciseState')
                .ask(this.$speech)
        }

        //this.$speech.addText("Benvenuto in remember me! Con questa skill potrai prenderti cura di chiunque soffra della patologia di Alzheimer. Potrai impostare i promemoria per i farmaci, per controllare e guidare l'assistito nelle sue azioni quotidiane come la cura di se o la preparazione dei pasti. Inoltre saranno disponibili anche dei giochi cognitivi per tenere la memoria sempre in allenamento. Ora configureremo insieme la skill, per prima cosa dimmi come si chiama il l'assistito.");
        //    this.followUpState('nameState')
        //        .ask(this.$speech);

        //this.$speech.addText("Bentornato " + user.name + "! Vuoi fare qualche esercizio per la memoria?")
        //this.followUpState('exerciseState')
        //    .ask(this.$speech)

        //return this.toStateIntent("pillsReminderState.pillsNameState" , "PillsNameIntent")
    },

    RepeatIntent() { // repeat
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

    nameState: {
        Unhandled() { // if user say something that is not a name
            this.$speech.addText("Per favore dimmi il tuo nome.");
            this.followUpState('nameState')
                .ask(this.$speech);
        },

        NameIntent() {
            user.name = this.$inputs.name.value //set user name
            console.log(this.$inputs)
            this.$speech.addText("Faccio il mio primo saluto a " + user.name + ". La prima funzionalità che questa skill offre, è la possibilità di ricordare a " + user.name + " di assumere tutti i farmaci che prende durante il giorno. Quindi vorresti attivare questa funzionalità?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('pillsReminderState')
                .ask(this.$speech, this.$reprompt);
        }
    },

    pillsReminderState: {
        Unhandled() {
            this.$speech.addText('Per favore rispondi si o no');
            this.followUpState('pillsReminderState')
                .ask(this.$speech);
        },

        YesIntent() {
            user.pills.active = true //set pills reminder on
            console.log("YES " + user.pills.active)
            this.$speech.addText("Bene! Ora imposteremo insieme i promemoria giornalieri per i farmaci. Per prima cosa dovrai dirmi uno alla volta i nomi dei farmaci che " + user.name + " prende durante il giorno. Dopo avermi comunicato il primo nome, dovrai dirmi a che ora del giorno dovrò ricordaglielo e così via per ogni farmaco. Bene iniziamo! Dimmi il nome del primo.");
            this.$reprompt.addText('Per favore elenca le pillole una alla volta');
            this.followUpState('pillsReminderState.pillsNameState')
                .ask(this.$speech);
        },

        NoIntent() {
            console.log("NO" + user.pills.active)
            if (user.pills.active) {
                this.$speech.addText("Perfetto abbiamo impostato tutti i promemoria per i farmaci. Da oggi in poi ogni giorno agli orari stabiliti ricorderò a " + user.name + " di prendere le pillole. Ora continuiamo con la configurazione. Vuoi attivare i promemoria giornalieri rigurdanti le azioni che " + user.name + " deve svolgere ogni giorno, come la cura di se e la preparazione dei pasti?");
            } else {
                this.$speech.addText("Va bene, continuiamo con la configurazione. Vuoi attivare i promemoria giornalieri rigurdanti le azioni che " + user.name + " deve svolgere ogni giorno, come la cura di se e la preparazione dei pasti?");
            }
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('dailyReminderState')
                .ask(this.$speech, this.$reprompt);
        },

        pillsNameState: {
            Unhandled() {
                this.$speech.addText('Per favore dimmi il nome di un farmaco');
                this.followUpState('pillsReminderState.pillsNameState')
                    .ask(this.$speech);
            },

            PillsNameIntent() {
                user.pills.pillsName.push(this.$inputs.medicine.value) // push medicine's name inside pillsName array
                console.log(user.pills.pillsName)
                this.$speech.addText("a che ora del giorno vuoi che gli ricordi questo farmaco?");
                this.$reprompt.addText('Per favore dimmi a che ora del giorno vuoi che glielo ricordi');
                this.followUpState('pillsReminderState.pillsTimeState')
                    .ask(this.$speech, this.$reprompt);
            }
        },

        pillsTimeState: {
            Unhandled() {
                this.$speech.addText('Per favore dimmi a che ora vuoi che gli ricordi il farmaco');
                this.followUpState('pillsReminderState.pillsTimeState')
                    .ask(this.$speech);
            },

            PillsTimeIntent() {
                console.log(this.$inputs)
                this.$speech.addText("Bene, glielo ricorderò ogni giorno alle " + this.$inputs.time.key + "! " + user.name + " prende altri farmaci?");
                this.$reprompt.addText('Per favore rispondi si o no');
                this.followUpState('pillsReminderState.otherPillsState')
                    .ask(this.$speech, this.$reprompt);
            },
        },

        otherPillsState: {
            Unhandled() {
                this.$speech.addText('Per favore rispondi si o no');
                this.followUpState('pillsReminderState.otherPillsState')
                    .ask(this.$speech);
            },

            YesIntent() {
                this.$speech.addText("Dimmi il nome del farmaco");
                this.$reprompt.addText('Per favore dimmi il nome del farmaco');
                this.followUpState('pillsReminderState.pillsNameState')
                    .ask(this.$speech, this.$reprompt);
            },
            NoIntent() {
                return this.toStateIntent('pillsReminderState', 'NoIntent');
            }
        }
    },

    dailyReminderState: {
        Unhandled() {
            this.$speech.addText('Per favore rispondi si o no');
            this.followUpState('dailyReminderState')
                .ask(this.$speech);
        },

        YesIntent() {
            user.dailyReminder = true //set defaultReminder on
            console.log("YES" + user.defaultReminder)
            this.$speech.addText("Bene! ancora un ultimo passo e la configurazione sarà completa. Questa skill ha una sezione dedicata agli esercizi cognitivi, che possono stimolare e ténere in attività " + user.name + ". Vorresti attivare questa sezione?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('setExercisesState')
                .ask(this.$speech, this.$reprompt);
        },
        NoIntent() {
            user.dailyReminder = false //set defaultReminder off
            console.log("NO" + user.defaultReminder)
            this.$speech.addText("Bene! ancora un ultimo passo e la configurazione sarà completa. Questa skill ha una sezione dedicata agli esercizi cognitivi, che possono stimolare e ténere in attività " + user.name + ". Vorresti attivare questa sezione?");
            this.$reprompt.addText('Per favore rispondi si o no');
            this.followUpState('setExercisesState')
                .ask(this.$speech, this.$reprompt);
        },
    },

    setExercisesState: {
        Unhandled() {
            this.$speech.addText('setExercisesState');
            this.followUpState('dailyReminderState')
                .ask(this.$speech);
        },

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

    exerciseState: {
        Unhandled() {
            this.$speech.addText("Per favore rispondi si o no?");
            this.followUpState('exerciseState')
                .ask(this.$speech);
        },

        YesIntent() {
            this.$speech.addText("Che esercizio vuoi fare tra 'dove mi trovo' o 'l'intruso'.");
            this.$reprompt.addText("Per favore scegli tra 'dove mi trovo' o 'l'intruso'.");
            this.followUpState('exerciseChoiceState')
                .ask(this.$speech, this.$reprompt);
        },

        NoIntent() {
            /*this.$speech.addText("Va bene. Vorresti cambiare le impostazioni dei promemoria?");
            this.followUpState('exerciseChoiceState')
                .ask(this.$speech, this.$reprompt);*/
        }
    },

    exerciseChoiceState: {
        Unhandled() {
            this.$speech.addText("Per favore scegli tra 'dove mi trovo' o 'l'intruso'.");
            this.followUpState('exerciseChoiceState')
                .ask(this.$speech, this.$reprompt);
        },

        ExerciseManagerIntent() {
            console.log(this.$inputs.exercise.key)
            switch (this.$inputs.exercise.key) {
                case 'intruso': return this.toStatelessIntent('IntruderExerciseIntent');
                case 'definizione': return this.toStatelessIntent('DefinitionExerciseIntent');
                case 'dove mi trovo': return this.toStatelessIntent('WhereAmIExerciseIntent');
            }
        }
    },

    IntruderExerciseIntent() {
        let wordGroup = [{ words: ["spada", "bermuda", "vestito", "cintura"], intruder: "spada" }, { words: ["matita", "penna", "divano", "gomma"], intruder: "divano" }, { words: ["cane", "criceto", "gatto", "peperone"], intruder: "peperone" }, { words: ["lampada", "forchetta", "piatto", "coltello"], intruder: "lampada" }]
        let randomWordGroup = wordGroup[Math.floor(Math.random() * wordGroup.length)].words
        let txtWords = randomWordGroup.join(", ")

        if (intruderExerciseCount == 0) {
            this.$speech.addText("Benvenuto nell'esercizio 'l'intruso'. Ora ti elencherò una serie di parole tutte collegate logicamente l'una con l'altra, tranne una. Tu dovrai dirmi quale tra quelle è l'intruso. Bene cominciamo. " + txtWords + ". Qual è l'intruso?");
            this.followUpState('intruderCheckState')
                .ask(this.$speech);
            intruderExerciseCount = 1
        } else if (intruderExerciseCount == 1) {
            this.$speech.addText("Bene, ecco le parole. " + txtWords + ". Qual è l'intruso?");
            this.followUpState('intruderCheckState')
                .ask(this.$speech);
        }
    },

    intruderCheckState: {
        Unhandled() {
            this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
            this.followUpState('intruderRetryState')
                .ask(this.$speech, this.$reprompt);
        },

        IntruderRightIntent() {
            this.$speech.addText("Risposta esatta, perfetto! Vuoi giocare ancora?");
            this.followUpState('intruderRetryState')
                .ask(this.$speech, this.$reprompt);
        }
    },

    intruderRetryState: {
        Unhandled() {
            this.$speech.addText("Per favore rispondi si o no.");
            this.followUpState('intruderRetryState')
                .ask(this.$speech);
        },

        YesIntent() {
            return this.toStatelessIntent('IntruderExerciseIntent')
        },

        NoIntent() {
            this.tell("Bene! Quando vuoi tornare a giocare io sono qui, a presto" + user.name)
            intruderExerciseCount = 0
        }
    },

    WhereAmIExerciseIntent() {
        if (whereAmIExerciseCount == 0) {
            this.$speech.addText("Benvenuto nell'esercizio 'dove mi trovo'. Dovrai cercare di collocarti nello spazio e nel tempo, rispondendo alle mie prossime domande. Bene cominciamo. In che stato ti trovi?");
            this.followUpState('whereCheckState.countryCheckState')
                .ask(this.$speech);
            whereAmIExerciseCount = 1
        } else {
            this.$speech.addText("Bene, ricominciamo. " + user.name + " in che stato ti trovi?");
            this.followUpState('whereCheckState.countryCheckState')
                .ask(this.$speech);
        }
    },

    whereCheckState: {
        Unhandled() {
            this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
            this.followUpState('whereAmIRetryState')
                .ask(this.$speech, this.$reprompt);
        },

        countryCheckState: {
            Unhandled() {
                this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                this.followUpState('whereAmIRetryState')
                    .ask(this.$speech, this.$reprompt);
            },

            WhereCountryIntent() {
                console.log(this.$inputs)
                if (this.$inputs.country.key == "italia") {
                    this.$speech.addText("Risposta esatta, proseguiamo! In che città ti trovi?");
                    this.followUpState('whereCheckState.cityCheckState')
                        .ask(this.$speech, this.$reprompt);
                } else {
                    this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                    this.followUpState('whereAmIRetryState')
                        .ask(this.$speech, this.$reprompt);
                }
            }
        },

        cityCheckState: {
            Unhandled() {
                this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                this.followUpState('whereAmIRetryState')
                    .ask(this.$speech, this.$reprompt);
            },

            WhereCityIntent() {
                console.log(this.$inputs)
                if (this.$inputs.city.key == "roma") {
                    this.$speech.addText("Risposta esatta! Ora passiamo all'ultima domanda. Che giorno della settimana è oggi?");
                    this.followUpState('whereCheckState.dayCheckState')
                        .ask(this.$speech, this.$reprompt);
                } else {
                    this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                    this.followUpState('whereAmIRetryState')
                        .ask(this.$speech, this.$reprompt);
                }
            }
        },

        dayCheckState: {
            Unhandled() {
                this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                this.followUpState('whereAmIRetryState')
                    .ask(this.$speech, this.$reprompt);
            },

            WhereDayIntent() {
                let date = new Date();
                let days = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
                let day = days[date.getDay()]

                if (this.$inputs.day.key == day) {
                    this.tell("Risposta esatta! Hai completato tutto l'esercizio correttamente. Quando vuoi tornare a giocare io sono qui, a presto " + user.name);
                } else {
                    this.$speech.addText("Risposta sbagliata, peccato! Vuoi riprovare?");
                    this.followUpState('whereAmIRetryState')
                        .ask(this.$speech, this.$reprompt);
                }
            }
        }
    },

    whereAmIRetryState: {
        Unhandled() {
            this.$speech.addText("Per favore rispondi si o no.");
            this.followUpState('whereAmIRetryState')
                .ask(this.$speech);
        },

        YesIntent() {
            return this.toStatelessIntent('WhereAmIExerciseIntent')
        },

        NoIntent() {
            this.tell("Bene! Quando vuoi tornare a giocare io sono qui, a presto " + user.name)
            whereAmIExerciseCount = 0
        }
    },

    DefinitionExerciseIntent() {
        this.tell('definizione')
    }

    /* end exercises region */

    /* pills reminder region */



    /* end pills reminder region */

    /* default reminder region */



    /* end default reminder region */
});

module.exports.app = app;
