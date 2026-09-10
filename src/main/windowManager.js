class WindowManager {
    constructor(window) {
        this.window = window;
    }

    move(x, y) {
        this.window.setPosition(
            Math.round(x),
            Math.round(y)
        );
    }

    getPosition() {
        return this.window.getPosition();
    }
}

module.exports = WindowManager;