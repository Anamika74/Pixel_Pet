console.log("PET ASSET MANAGER IS RUNNING");


class PetAssetManager {

    constructor(petName = "cat") {

        this.petName = petName;

        this.basePath =
            `../assets/pets/${this.petName}`;

        this.animations = {

            idle: {
                frames: [
                    "idle.svg"
                ],
                speed: 1000
            },

            blink: {
                frames: [
                    "blink.svg"
                ],
                speed: 180
            },

            walk: {
                frames: [
                    "walk1.svg",
                    "walk2.svg",
                    "walk3.svg",
                    "walk4.svg"
                ],
                speed: 160
            },

            sit: {
                frames: [
                    "sit.svg"
                ],
                speed: 1000
            },

            stretch: {
                frames: [
                    "stretch1.svg",
                    "stretch2.svg"
                ],
                speed: 300
            },

            look: {
                frames: [
                    "look1.svg",
                    "look2.svg"
                ],
                speed: 400
            },

            happy: {
                frames: [
                    "happy1.svg",
                    "happy2.svg"
                ],
                speed: 250
            },
            jump: {
                 frames: [
                    "jump1.svg",
                    "jump2.svg"
                ],
                speed: 180
            },
            
            eat: {
                frames: [
                    "eat1.svg",
                    "eat2.svg"
                ],
                speed: 300
            },

            play: {
                frames: [
                    "play1.svg",
                    "play2.svg"
                ],
                speed: 300
            },

            sleep: {
                frames: [
                    "sleep.svg"
                ],
                speed: 1000
            }
        };
    }


    getAnimation(animationName) {

        const animation =
            this.animations[animationName];

        if (!animation) {

            console.warn(
                `Animation "${animationName}" not found for ${this.petName}`
            );

            return null;
        }

        return animation.frames.map(
            frame =>
                `${this.basePath}/${animationName}/${frame}`
        );
    }


    getSpeed(animationName) {

        const animation =
            this.animations[animationName];

        if (!animation) {
            return 150;
        }

        return animation.speed;
    }


    hasAnimation(animationName) {

        return Boolean(
            this.animations[animationName]
        );
    }


    setPet(petName) {

        this.petName = petName;

        this.basePath =
            `../assets/pets/${this.petName}`;

        console.log(
            `Pet changed to: ${this.petName}`
        );
    }


    getPetName() {

        return this.petName;
    }
}