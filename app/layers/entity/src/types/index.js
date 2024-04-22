export var Status;
(function (Status) {
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
export var FileState;
(function (FileState) {
    FileState[FileState["PENDING"] = 1] = "PENDING";
    FileState[FileState["PERSISTED"] = 2] = "PERSISTED";
    FileState[FileState["DELETED"] = 4] = "DELETED";
})(FileState || (FileState = {}));
export var MigrationStatus;
(function (MigrationStatus) {
    MigrationStatus[MigrationStatus["IDLE"] = 1] = "IDLE";
    MigrationStatus[MigrationStatus["RUNNING"] = 2] = "RUNNING";
})(MigrationStatus || (MigrationStatus = {}));
export var MigrationItemStatus;
(function (MigrationItemStatus) {
    MigrationItemStatus[MigrationItemStatus["INITIAL"] = 1] = "INITIAL";
    MigrationItemStatus[MigrationItemStatus["QUEUED"] = 2] = "QUEUED";
    MigrationItemStatus[MigrationItemStatus["PENDING"] = 4] = "PENDING";
    MigrationItemStatus[MigrationItemStatus["IMPORTED"] = 8] = "IMPORTED";
    MigrationItemStatus[MigrationItemStatus["ERRORED"] = 16] = "ERRORED";
    MigrationItemStatus[MigrationItemStatus["SKIPPED"] = 32] = "SKIPPED";
})(MigrationItemStatus || (MigrationItemStatus = {}));
