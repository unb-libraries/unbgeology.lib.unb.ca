// Register custom commands and other extensions here.

declare namespace Cypress {
  interface Chainable {
    /**
     * Login as the user with the given username.
     *
     * @example cy.login('jdoe')
     */
    login(username: string): void
  }
}

Cypress.Commands.add(`login`, (username) => {
  cy.request(`POST`, `/api/local/login`, { username })
})
