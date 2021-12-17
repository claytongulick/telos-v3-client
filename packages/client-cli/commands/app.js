/**
 * Class that handles application building.
 */
class AppCommands {
    static async build(options) {

    }

    static async start(options) {
        let name = options.name;
        let all = options.all;

        if(!options.all)
            if(!options.name)
                return console.error("Must specify app to run or --all");

    }
}

module.exports = AppCommands;