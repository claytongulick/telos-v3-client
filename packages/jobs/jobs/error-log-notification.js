const ErrorLog = require("common/db/models/error_log");

class JobErrorNotification {
    async run() {
        ErrorLog.findAll({where: {notifications_processed: false}})

    }
}