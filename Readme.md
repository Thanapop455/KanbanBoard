API Endpoints Summary (Kanban Board)

Auth
| Endpoint            | Method | Description       | Headers                         | Body                              |
| ------------------- | ------ | ----------------- | ------------------------------- | --------------------------------- |
| `/api/login`        | POST   | Login             | –                               | `{ "email": "", "password": "" }` |
| `/api/register`     | POST   | Register          | –                               | `{ "email": "", "password": "" }` |
| `/api/current-user` | POST   | Verify & fetch me | `Authorization: Bearer <token>` | `{}`                              |

Boards
| Endpoint                             | Method | Description                              | Headers | Body                      |
| ------------------------------------ | ------ | ---------------------------------------- | ------- | ------------------------- |
| `/api/boards`                        | GET    | List my boards                           | Bearer  | –                         |
| `/api/boards`                        | POST   | Create board                             | Bearer  | `{ "name": "Project A" }` |
| `/api/boards/:id`                    | GET    | Get board detail (incl. members, counts) | Bearer  | –                         |
| `/api/boards/:id`                    | PUT    | Rename board                             | Bearer  | `{ "name": "New name" }`  |
| `/api/boards/:id`                    | DELETE | Delete board                             | Bearer  | –                         |
| `/api/boards/:id/leave`              | POST   | Leave board (non-owner)                  | Bearer  | `{}`                      |
| `/api/boards/:id/transfer-ownership` | POST   | Transfer ownership                       | Bearer  | `{ "userId": number }`    |

Members / Invites
| Endpoint                                    | Method | Description                | Headers | Body                            |             |
| ------------------------------------------- | ------ | -------------------------- | ------- | ------------------------------- | ----------- |
| `/api/boards/:boardId/members`              | GET    | List members               | Bearer  | –                               |             |
| `/api/boards/:boardId/members/:userId/role` | PATCH  | Change role (ADMIN/MEMBER) | Bearer  | `{ "role": "ADMIN"              | "MEMBER" }` |
| `/api/boards/:boardId/members/:userId`      | DELETE | Remove member              | Bearer  | –                               |             |
| `/api/boards/:boardId/invite`               | POST   | Create invite for email    | Bearer  | `{ "email": "", "role": "ADMIN" | "MEMBER" }` |
| `/api/invites/:token/accept`                | POST   | Accept invite              | Bearer  | `{}`                            |             |

Columns
| Endpoint                               | Method | Description            | Headers | Body                               |
| -------------------------------------- | ------ | ---------------------- | ------- | ---------------------------------- |
| `/api/boards/:boardId/columns`         | GET    | List columns in board  | Bearer  | –                                  |
| `/api/boards/:boardId/columns`         | POST   | Create column          | Bearer  | `{ "name": "To Do" }`              |
| `/api/columns/:id`                     | PUT    | Rename column          | Bearer  | `{ "name": "Doing" }`              |
| `/api/columns/:id`                     | DELETE | Delete column (+tasks) | Bearer  | –                                  |
| `/api/boards/:boardId/columns/reorder` | PATCH  | Reorder columns        | Bearer  | `{ "order": [colId1,colId2,...] }` |

Tasks
| Endpoint                               | Method | Description                                          | Headers | Body                                                  |        |      |                               |         |
| -------------------------------------- | ------ | ---------------------------------------------------- | ------- | ----------------------------------------------------- | ------ | ---- | ----------------------------- | ------- |
| `/api/boards/:boardId/tasks`           | GET    | List tasks of a board (support filters via `params`) | Bearer  | –                                                     |        |      |                               |         |
| `/api/columns/:columnId/tasks`         | POST   | Create task in column                                | Bearer  | `{ "title": "", "description": null, "priority": "LOW | MEDIUM | HIGH | URGENT", "dueDate": ISOString | null }` |
| `/api/tasks/:id`                       | PUT    | Update task (rename/edit fields)                     | Bearer  | partial Task fields                                   |        |      |                               |         |
| `/api/tasks/:id`                       | DELETE | Delete task                                          | Bearer  | –                                                     |        |      |                               |         |
| `/api/tasks/:id/move`                  | PATCH  | Move task to another column/index                    | Bearer  | `{ "toColumnId": number, "newIndex": number }`        |        |      |                               |         |
| `/api/columns/:columnId/tasks/reorder` | PATCH  | Reorder tasks in column                              | Bearer  | `{ "order": [taskId...] }`                            |        |      |                               |         |

Subtasks
| Endpoint                              | Method | Description           | Headers | Body                                                  |
| ------------------------------------- | ------ | --------------------- | ------- | ----------------------------------------------------- |
| `/api/tasks/:taskId/subtasks`         | GET    | List subtasks         | Bearer  | –                                                     |
| `/api/tasks/:taskId/subtasks`         | POST   | Create subtask        | Bearer  | `{ "title": "" }`                                     |
| `/api/subtasks/:id`                   | PUT    | Update title / isDone | Bearer  | `{ "title"?: "", "isDone"?: boolean }`                |
| `/api/subtasks/:id`                   | DELETE | Delete subtask        | Bearer  | –                                                     |
| `/api/tasks/:taskId/subtasks/reorder` | PATCH  | Reorder subtasks      | Bearer  | `{ "order": [subtaskId...] }` *(ตามโค้ดคุณมีไว้แล้ว)* |

Tags
| Endpoint                         | Method | Description        | Headers | Body                           |         |
| -------------------------------- | ------ | ------------------ | ------- | ------------------------------ | ------- |
| `/api/boards/:boardId/tags`      | GET    | List tags in board | Bearer  | –                              |         |
| `/api/boards/:boardId/tags`      | POST   | Create tag         | Bearer  | `{ "name": "", "color": "#hex" | null }` |
| `/api/tags/:id`                  | PUT    | Update tag         | Bearer  | `{ "name": "", "color": "#hex" | null }` |
| `/api/tags/:id`                  | DELETE | Delete tag         | Bearer  | –                              |         |
| `/api/tasks/:taskId/tags`        | POST   | Attach tag to task | Bearer  | `{ "tagId": number }`          |         |
| `/api/tasks/:taskId/tags/:tagId` | DELETE | Detach tag         | Bearer  | –                              |         |

Assignees
| Endpoint                               | Method | Description    | Headers | Body                   |
| -------------------------------------- | ------ | -------------- | ------- | ---------------------- |
| `/api/tasks/:taskId/assignees`         | GET    | List assignees | Bearer  | –                      |
| `/api/tasks/:taskId/assignees`         | POST   | Assign user    | Bearer  | `{ "userId": number }` |
| `/api/tasks/:taskId/assignees/:userId` | DELETE | Unassign user  | Bearer  | –                      |
