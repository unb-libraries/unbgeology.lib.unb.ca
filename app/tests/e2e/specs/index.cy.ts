describe("UNB Earth Science Centre Collection", () => {
  it('should load the front page', () => {
    cy.visit('/')
    cy.contains('Welcome to Nuxt')
  })
})