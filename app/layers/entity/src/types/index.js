export var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus[MigrationStatus["INITIAL"] = 1] = "INITIAL";
    MigrationStatus[MigrationStatus["IDLE"] = 2] = "IDLE";
    MigrationStatus[MigrationStatus["PENDING"] = 4] = "PENDING";
    MigrationStatus[MigrationStatus["RUNNING"] = 8] = "RUNNING";
    MigrationStatus[MigrationStatus["IMPORTED"] = 16] = "IMPORTED";
    MigrationStatus[MigrationStatus["ERRORED"] = 32] = "ERRORED";
    MigrationStatus[MigrationStatus["SKIPPED"] = 64] = "SKIPPED";
})(MigrationStatus || (MigrationStatus = {}));
