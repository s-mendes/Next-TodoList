const BASE_URL = "http://localhost:3000";

describe("/ - Todo Feed", () => {
  it("when load, renders the page", () => {
    cy.visit(BASE_URL);
  });

  it("when create a new todo, it must appers in the screen", () => {
    cy.intercept("POST", `${BASE_URL}/api/todos`, (req) => {
      req.reply({
        status: 201,
        body: {
          todo: {
            id: "75403ff5-1623-41f1-b917-1887f0b8cdcb",
            date: "2024-10-09T20:59:33.803Z",
            content: "Test todo",
            done: false,
          },
        },
      });
    }).as("createTodo");
    cy.visit(BASE_URL);
    cy.get("input[name='add-todo']").type("Test todo");
    cy.get("button[aria-label='Adicionar novo item']").click();
    cy.get("table > tbody").contains("Test todo");
  });
});
