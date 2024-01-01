Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001')
  })

  it('displays the username and password input fields', () => {
    cy.get('[data-cy="email"]').should('be.visible')
    cy.get('[data-cy="password"]').should('be.visible')
  })

  it('does not render error alert initially', () => {
    cy.get('.v-alert').should('not.exist')
  })

  it('renders error alert when login fails', () => {
    cy.intercept(
      'POST',
      'http://localhost:8080/api/trpc/authDietician.login?batch=1',
    ).as('loginRequest')

    cy.get('[data-cy=email]').type('wrongemail@example.com')
    cy.get('[data-cy=password]').type('wrongpassword')
    cy.get('.v-btn').click()

    cy.wait('@loginRequest').then(({ response }) => {
      expect(response?.statusCode).to.equal(404)
      cy.get('.v-alert').should('be.visible')
    })
  })

  it('submits the form and navigates to the dashboard when login succeeds', () => {
    cy.get('[data-cy=email]').type('diet@test.com')
    cy.get('[data-cy=password]').type('password')
    cy.get('.v-btn').click()
    cy.url().should('include', '/dashboard/my-profile')
  })
})
