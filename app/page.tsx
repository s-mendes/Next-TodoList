"use client";
import { todoController } from "@client/controller/todoController";
import { GlobalStyles } from "@ui/theme/GlobalStyles";
import { useEffect, useRef, useState } from "react";

const bg = "/bg.png";

interface HomeTodo {
  id: string;
  content: string;
  done: boolean;
}

export default function Page() {
  const initialLoadComplete = useRef(false);
  const [totalPages, setTotalPages] = useState(0);
  const [todos, setTodos] = useState<HomeTodo[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [newTodoContent, setNewTodoContent] = useState("");
  const hasMorePages = page < totalPages;
  const homeTodos = todoController.filterTodosByContent(todos, search);

  const hasNoTodos = homeTodos.length === 0 && !isLoading;

  useEffect(() => {
    if (!initialLoadComplete.current) {
      todoController
        .get({ page })
        .then(({ todos, pages }) => {
          setTodos(todos);
          setTotalPages(pages);
        })
        .finally(() => {
          setIsLoading(false);
          initialLoadComplete.current = true;
        });
    }
  }, []);

  return (
    <main>
      <GlobalStyles themeName="indigo" />
      <header
        style={{
          backgroundImage: `url('${bg}')`,
        }}
      >
        <div className="typewriter">
          <h1>O que fazer hoje?</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            todoController.create({
              content: newTodoContent,
              onSuccess(todo: HomeTodo) {
                setTodos((oldTodos) => [todo, ...oldTodos]);
              },
              onError(customMessage: string) {
                alert(
                  customMessage ||
                    "Você precisa ter um conteúdo para adicionar um novo item!"
                );
              },
            });
            setNewTodoContent("");
          }}
        >
          <input
            name="add-todo"
            type="text"
            placeholder="Correr, Estudar..."
            value={newTodoContent}
            onChange={(e) => {
              setNewTodoContent(e.target.value);
            }}
          />
          <button type="submit" aria-label="Adicionar novo item">
            +
          </button>
        </form>
      </header>

      <section>
        <form>
          <input
            type="text"
            placeholder="Filtrar lista atual, ex: Dentista"
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <table border={1}>
          <thead>
            <tr>
              <th align="left">
                <input type="checkbox" disabled />
              </th>
              <th align="left">Id</th>
              <th align="left">Conteúdo</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {homeTodos.map((todo) => (
              <tr key={todo.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => {
                      todoController.toggleDone({
                        id: todo.id,
                        onSuccess() {
                          // Do nothing
                        },
                        onError(customMessage: string) {
                          alert(customMessage);
                        },
                        updateTodoOnScreen() {
                          setTodos((currentTodos) => {
                            return currentTodos.map((currentTodo) =>
                              currentTodo.id === todo.id
                                ? { ...currentTodo, done: !currentTodo.done }
                                : currentTodo
                            );
                          });
                        },
                      });
                    }}
                  />
                </td>
                <td>{todo.id.substring(0, 4)}</td>
                <td>
                  {!todo.done && todo.content}
                  {todo.done && <s>{todo.content}</s>}
                </td>
                <td align="right">
                  <button
                    data-type="delete"
                    onClick={async () => {
                      await todoController.deleteById({
                        id: todo.id,
                        onSuccess() {
                          setTodos((currentTodos) => {
                            return currentTodos.filter(
                              (currentTodo) => currentTodo.id !== todo.id
                            );
                          });
                        },
                        onError(customMessage: string) {
                          alert(customMessage);
                        },
                      });
                    }}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}

            {isLoading && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  Carregando...
                </td>
              </tr>
            )}

            {hasNoTodos && (
              <tr>
                <td colSpan={4} align="center">
                  Nenhum item encontrado
                </td>
              </tr>
            )}

            {hasMorePages && (
              <tr>
                <td colSpan={4} align="center" style={{ textAlign: "center" }}>
                  <button
                    data-type="load-more"
                    onClick={() => {
                      setIsLoading(true);
                      const nextPage = page + 1;
                      setPage(nextPage);

                      todoController
                        .get({ page: nextPage })
                        .then(({ todos, pages }) => {
                          setTodos((oldTodos) => [...oldTodos, ...todos]);
                          setTotalPages(pages);
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }}
                  >
                    Página {page}, Carregar mais{" "}
                    <span
                      style={{
                        display: "inline-block",
                        marginLeft: "4px",
                        fontSize: "1.2em",
                      }}
                    >
                      ↓
                    </span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
