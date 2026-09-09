console.log("STATS MANAGER IS RUNNING");


class StatsManager {

    constructor() {

        this.storageKey =
            "pixelPetStats";

        this.maxStat =
            100;

        this.stats = {
            happiness: 70,
            energy: 80
        };

        /*
         * Decay configuration
         *
         * Happiness:
         * -1 every 5 minutes
         *
         * Energy:
         * -1 every 3 minutes
         */

        this.happinessDecayInterval =
            5 * 60 * 1000;

        this.energyDecayInterval =
            3 * 60 * 1000;

        this.decayTimer = null;

        this.listeners = [];

        this.lastUpdate =
            Date.now();

        this.load();

        this.startDecay();
    }


    /* =================================
       LOAD
    ================================= */

    load() {

        try {

            const saved =
                localStorage.getItem(
                    this.storageKey
                );

            if (!saved) {
                return;
            }

            const parsed =
                JSON.parse(saved);


            if (
                typeof parsed.happiness ===
                "number"
            ) {

                this.stats.happiness =
                    this.clamp(
                        parsed.happiness
                    );
            }


            if (
                typeof parsed.energy ===
                "number"
            ) {

                this.stats.energy =
                    this.clamp(
                        parsed.energy
                    );
            }


            /*
             * Handle time spent while
             * the application was closed.
             */

            if (
                typeof parsed.lastUpdate ===
                "number"
            ) {

                this.applyOfflineDecay(
                    parsed.lastUpdate
                );
            }

        } catch (error) {

            console.error(
                "Could not load pet stats:",
                error
            );
        }
    }


    /* =================================
       SAVE
    ================================= */

    save() {

        localStorage.setItem(

            this.storageKey,

            JSON.stringify({

                happiness:
                    this.stats.happiness,

                energy:
                    this.stats.energy,

                lastUpdate:
                    Date.now()
            })
        );
    }


    /* =================================
       OFFLINE DECAY
    ================================= */

    applyOfflineDecay(lastUpdate) {

        const now =
            Date.now();

        const elapsed =
            now - lastUpdate;


        if (elapsed <= 0) {
            return;
        }


        /*
         * How many complete decay
         * intervals passed?
         */

        const happinessDecay =
            Math.floor(
                elapsed /
                this.happinessDecayInterval
            );


        const energyDecay =
            Math.floor(
                elapsed /
                this.energyDecayInterval
            );


        if (
            happinessDecay > 0
        ) {

            this.stats.happiness =
                this.clamp(

                    this.stats.happiness -
                    happinessDecay
                );
        }


        if (
            energyDecay > 0
        ) {

            this.stats.energy =
                this.clamp(

                    this.stats.energy -
                    energyDecay
                );
        }


        this.lastUpdate =
            now;


        this.save();
    }


    /* =================================
       START DECAY
    ================================= */

    startDecay() {

        this.stopDecay();


        /*
         * Check every 30 seconds.
         *
         * The actual decay is still
         * based on elapsed time.
         */

        this.decayTimer =
            setInterval(
                () => {

                    this.updateDecay();

                },
                30 * 1000
            );
    }


    /* =================================
       STOP DECAY
    ================================= */

    stopDecay() {

        if (
            this.decayTimer
        ) {

            clearInterval(
                this.decayTimer
            );

            this.decayTimer =
                null;
        }
    }


    /* =================================
       UPDATE DECAY
    ================================= */

    updateDecay() {

        const now =
            Date.now();

        const elapsed =
            now - this.lastUpdate;


        if (elapsed <= 0) {
            return;
        }


        const happinessDecay =
            Math.floor(
                elapsed /
                this.happinessDecayInterval
            );


        const energyDecay =
            Math.floor(
                elapsed /
                this.energyDecayInterval
            );


        let changed = false;


        if (
            happinessDecay > 0
        ) {

            this.stats.happiness =
                this.clamp(

                    this.stats.happiness -
                    happinessDecay
                );

            changed = true;
        }


        if (
            energyDecay > 0
        ) {

            this.stats.energy =
                this.clamp(

                    this.stats.energy -
                    energyDecay
                );

            changed = true;
        }


        /*
         * Only move the timestamp forward
         * when we actually processed the
         * elapsed intervals.
         */

        if (
            happinessDecay > 0 ||
            energyDecay > 0
        ) {

            this.lastUpdate =
                now;
        }


        if (changed) {

            this.save();

            this.notify();

            this.printStats();
        }
    }


    /* =================================
       CLAMP
    ================================= */

    clamp(value) {

        return Math.max(

            0,

            Math.min(

                this.maxStat,

                Math.round(value)
            )
        );
    }


    /* =================================
       GETTERS
    ================================= */

    getHappiness() {

        return this.stats.happiness;
    }


    getEnergy() {

        return this.stats.energy;
    }


    getStats() {

        return {

            happiness:
                this.stats.happiness,

            energy:
                this.stats.energy
        };
    }


    /* =================================
       LISTENERS
    ================================= */

    subscribe(callback) {

        if (
            typeof callback !==
            "function"
        ) {

            return;
        }

        this.listeners.push(
            callback
        );
    }


    notify() {

        const stats =
            this.getStats();


        this.listeners.forEach(
            callback => {

                try {

                    callback(stats);

                } catch (error) {

                    console.error(
                        "Stats listener error:",
                        error
                    );
                }
            }
        );
    }


    /* =================================
       HAPPINESS
    ================================= */

    changeHappiness(amount) {

        this.stats.happiness =
            this.clamp(

                this.stats.happiness +
                amount
            );

        this.lastUpdate =
            Date.now();

        this.save();

        this.notify();

        this.printStats();
    }


    setHappiness(value) {

        this.stats.happiness =
            this.clamp(value);

        this.lastUpdate =
            Date.now();

        this.save();

        this.notify();
    }


    /* =================================
       ENERGY
    ================================= */

    changeEnergy(amount) {

        this.stats.energy =
            this.clamp(

                this.stats.energy +
                amount
            );

        this.lastUpdate =
            Date.now();

        this.save();

        this.notify();

        this.printStats();
    }


    setEnergy(value) {

        this.stats.energy =
            this.clamp(value);

        this.lastUpdate =
            Date.now();

        this.save();

        this.notify();
    }


    /* =================================
       RESET
    ================================= */

    reset() {

        this.stats = {

            happiness: 70,

            energy: 80
        };

        this.lastUpdate =
            Date.now();

        this.save();

        this.notify();

        console.log(
            "Pet stats reset"
        );
    }


    /* =================================
       DEBUG
    ================================= */

    printStats() {

        console.log(

            `Happiness: ${this.stats.happiness}` +
            ` | Energy: ${this.stats.energy}`
        );
    }
}