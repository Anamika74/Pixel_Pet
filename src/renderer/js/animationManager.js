console.log("ANIMATION MANAGER IS RUNNING");

class AnimationManager {
    constructor(
        petElement,
        petAssetManager
    ) {
        this.pet = petElement;

        this.container =
            document.getElementById(
                "pet-container"
            );

        this.petAssets =
            petAssetManager;

        this.currentAnimation = null;

        this.frameIndex = 0;

        this.animationTimer = null;

        this.blinkTimer = null;

        this.effectTimer = null;

        this.animationToken = 0;
    }

    play(
        animationName,
        speed = null,
        options = {}
    ) {
        if (
            !this.petAssets.hasAnimation(
                animationName
            )
        ) {
            console.warn(
                `Animation "${animationName}" does not exist.`
            );

            return;
        }

        const {
            loop = true,
            onComplete = null,
            restart = true
        } = options;

        /*
         * If the same animation is already playing,
         * don't restart it unnecessarily.
         */
        if (
            !restart &&
            this.currentAnimation === animationName &&
            this.animationTimer
        ) {
            return;
        }

        this.stop();

        this.clearEffect();

        this.currentAnimation =
            animationName;

        this.frameIndex = 0;

        const frames =
            this.petAssets.getAnimation(
                animationName
            );

        if (
            !frames ||
            frames.length === 0
        ) {
            return;
        }

        const animationSpeed =
            speed ??
            this.petAssets.getSpeed(
                animationName
            );

        /*
         * Token prevents an old animation callback
         * from affecting a newer animation.
         */
        const token =
            ++this.animationToken;

        const showFrame = () => {
            if (
                token !==
                this.animationToken
            ) {
                return;
            }

            if (
                this.currentAnimation !==
                animationName
            ) {
                return;
            }

            this.pet.src =
                frames[this.frameIndex];

            this.frameIndex++;
        };

        /*
         * First frame.
         */
        this.frameIndex = 0;

        this.pet.src = frames[0];

        /*
         * Single-frame animation.
         */
        if (frames.length === 1) {
            if (!loop) {
                setTimeout(() => {
                    if (
                        token ===
                        this.animationToken
                    ) {
                        if (onComplete) {
                            onComplete();
                        }
                    }
                }, animationSpeed);

                return;
            }

            return;
        }

        /*
         * Multi-frame animation.
         */
        this.animationTimer =
            setInterval(() => {

                if (
                    token !==
                    this.animationToken
                ) {
                    return;
                }

                if (
                    this.frameIndex >=
                    frames.length
                ) {
                    if (!loop) {
                        this.stop();

                        if (onComplete) {
                            onComplete();
                        }

                        return;
                    }

                    this.frameIndex = 0;
                }

                showFrame();

            }, animationSpeed);

        this.applyEffect(
            animationName
        );
    }

    playOnce(
        animationName,
        speed = null,
        onComplete = null
    ) {
        this.play(
            animationName,
            speed,
            {
                loop: false,
                onComplete
            }
        );
    }

    applyEffect(animationName) {
        if (!this.container) {
            return;
        }

        this.container.classList.remove(
            "happy",
            "look",
            "sleep",
            "sitting",
            "stretching",
            "playing",
            "eating"
        );

        switch (animationName) {

            case "happy":
                this.container.classList.add(
                    "happy"
                );
                break;

            case "look":
                this.container.classList.add(
                    "look"
                );
                break;

            case "sleep":
                this.container.classList.add(
                    "sleep"
                );
                break;

            case "sit":
                this.container.classList.add(
                    "sitting"
                );
                break;

            case "stretch":
                this.container.classList.add(
                    "stretching"
                );
                break;

            case "play":
                this.container.classList.add(
                    "playing"
                );
                break;

            case "eat":
                this.container.classList.add(
                    "eating"
                );
                break;
        }
    }

    stop() {
        if (this.animationTimer) {
            clearInterval(
                this.animationTimer
            );

            this.animationTimer = null;
        }

        this.animationToken++;
    }

    startBlinking() {
        this.stopBlinking();

        const blink = () => {

            if (
                this.currentAnimation ===
                "idle"
            ) {
                this.playOnce(
                    "blink",
                    180,
                    () => {

                        if (
                            this.currentAnimation !==
                            "blink"
                        ) {
                            return;
                        }

                        this.play(
                            "idle"
                        );
                    }
                );
            }

            const nextBlink =
                2500 +
                Math.random() * 4000;

            this.blinkTimer =
                setTimeout(
                    blink,
                    nextBlink
                );
        };

        this.blinkTimer =
            setTimeout(
                blink,
                2500
            );
    }

    stopBlinking() {
        if (this.blinkTimer) {
            clearTimeout(
                this.blinkTimer
            );

            this.blinkTimer = null;
        }
    }

    clearEffect() {
        if (this.effectTimer) {
            clearTimeout(
                this.effectTimer
            );

            this.effectTimer = null;
        }

        if (!this.container) {
            return;
        }

        this.container.classList.remove(
            "happy",
            "look",
            "sleep",
            "sitting",
            "stretching",
            "playing",
            "eating"
        );
    }

    getCurrentAnimation() {
        return this.currentAnimation;
    }
}