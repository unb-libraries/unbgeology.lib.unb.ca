export default defineMongooseFormatter(Affiliate.Organization, (doc) => {
  const { address, contact, type } = doc
  return {
    address,
    contact,
    type: type && `organization`,
  }
}, {
  enable: (doc: any) => matchInputType(doc, Affiliate.Organization.fullName, { typeField: `__type` }),
})
