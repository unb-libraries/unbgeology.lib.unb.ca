export var Status;
(function (Status) {
    Status[Status["DRAFT"] = 1] = "DRAFT";
    Status[Status["IMPORTED"] = 2] = "IMPORTED";
    Status[Status["PUBLISHED"] = 4] = "PUBLISHED";
})(Status || (Status = {}));
// REFACTOR: Move to app/layers/base/types/index.d.ts
export var FilterOperator;
(function (FilterOperator) {
    FilterOperator["EQ"] = "eq";
    FilterOperator["NE"] = "ne";
    FilterOperator["MA"] = "ma";
    FilterOperator["NM"] = "nm";
    FilterOperator["IN"] = "in";
    FilterOperator["NI"] = "ni";
    FilterOperator["GT"] = "gt";
    FilterOperator["GE"] = "ge";
    FilterOperator["LT"] = "lt";
    FilterOperator["LE"] = "le";
    FilterOperator["CT"] = "ct";
    FilterOperator["NC"] = "nc";
    FilterOperator["EX"] = "ex";
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
