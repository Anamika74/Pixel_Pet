console.log("SETTINGS MANAGER IS RUNNING");

class SettingsManager {

    constructor() {

        this.defaults = {
            startup: true,
            alwaysOnTop: false,
            randomMessages: true,
            breakReminders: true,
            notifications: true,
            moodBehavior: true
        };

        this.settings = this.load();
    }

    load() {

        try {

            const saved =
                localStorage.getItem("pixelPetSettings");

            if (!saved) {
                return { ...this.defaults };
            }

            return {
                ...this.defaults,
                ...JSON.parse(saved)
            };

        } catch (error) {

            console.error(
                "Failed to load settings:",
                error
            );

            return { ...this.defaults };
        }
    }

    save() {

        localStorage.setItem(
            "pixelPetSettings",
            JSON.stringify(this.settings)
        );

        this.apply();
    }

    get(name) {

        return this.settings[name];
    }

    set(name, value) {

        if (!(name in this.defaults)) {
            console.warn(
                `Unknown setting: ${name}`
            );
            return;
        }

        this.settings[name] = value;

        this.save();
    }

    toggle(name) {

        this.set(
            name,
            !this.get(name)
        );
    }

    reset() {

        this.settings =
            { ...this.defaults };

        this.save();
    }

    getAll() {

        return {
            ...this.settings
        };
    }

    apply() {

        if (window.petAPI?.setAlwaysOnTop) {

            window.petAPI.setAlwaysOnTop(
                this.settings.alwaysOnTop
            );
        }

        if (window.petAPI?.setStartup) {

            window.petAPI.setStartup(
                this.settings.startup
            );
        }
    }
}