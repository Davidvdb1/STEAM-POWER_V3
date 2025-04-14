class TestLogger {
    static log(message) {
        console.log("\x1b[32m", "✔", message, "\x1b[0m");
    }
    static error(message, error) {
        console.error("\x1b[31m", message, "\x1b[0m");
        console.error("\x1b[31m", "\t", error, "\x1b[0m");
    }
}

module.exports = TestLogger;