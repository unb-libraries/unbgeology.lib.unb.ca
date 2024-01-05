export var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus["CREATED"] = "created";
    MigrationStatus["RUNNING"] = "running";
    MigrationStatus["SUCCEDED"] = "succeded";
    MigrationStatus["FAILED"] = "failed";
})(MigrationStatus || (MigrationStatus = {}));
export var MigrationItemStatus;
(function (MigrationItemStatus) {
    MigrationItemStatus["CREATED"] = "created";
    MigrationItemStatus["WAITING"] = "waiting";
    MigrationItemStatus["IMPORTED"] = "imported";
    MigrationItemStatus["FAILED"] = "failed";
})(MigrationItemStatus || (MigrationItemStatus = {}));
