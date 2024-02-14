export var Status;
(function (Status) {
    Status[Status["DRAFT"] = 1] = "DRAFT";
    Status[Status["IMPORTED"] = 2] = "IMPORTED";
    Status[Status["PUBLISHED"] = 4] = "PUBLISHED";
})(Status || (Status = {}));
// REFACTOR: Move to app/layers/base/types/index.d.ts
export var FilterOperator;
(function (FilterOperator) {
    FilterOperator[FilterOperator["EQUALS"] = 1] = "EQUALS";
    FilterOperator[FilterOperator["MATCH"] = 2] = "MATCH";
    FilterOperator[FilterOperator["GREATER"] = 4] = "GREATER";
    FilterOperator[FilterOperator["LESS"] = 8] = "LESS";
    FilterOperator[FilterOperator["NOT"] = 16] = "NOT";
    FilterOperator[FilterOperator["AND"] = 32] = "AND";
    FilterOperator[FilterOperator["OR"] = 64] = "OR";
})(FilterOperator || (FilterOperator = {}));
export var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus[MigrationStatus["INITIAL"] = 1] = "INITIAL";
    MigrationStatus[MigrationStatus["IDLE"] = 2] = "IDLE";
    MigrationStatus[MigrationStatus["PENDING"] = 4] = "PENDING";
    MigrationStatus[MigrationStatus["RUNNING"] = 8] = "RUNNING";
    MigrationStatus[MigrationStatus["IMPORTED"] = 16] = "IMPORTED";
    MigrationStatus[MigrationStatus["ERRORED"] = 32] = "ERRORED";
    MigrationStatus[MigrationStatus["SKIPPED"] = 64] = "SKIPPED";
    MigrationStatus[MigrationStatus["QUEUED"] = 128] = "QUEUED";
})(MigrationStatus || (MigrationStatus = {}));
