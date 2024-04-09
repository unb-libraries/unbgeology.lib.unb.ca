export default loadDocumentModel([
  Affiliate.Person,
  Affiliate.Organization,
  Classification.Fossil,
  Classification.Mineral,
  Classification.Rock,
  FossilPortion,
  StorageLocation,
], { path: /^\/api\/terms/ })
