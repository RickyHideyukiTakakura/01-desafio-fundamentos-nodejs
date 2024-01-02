import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { title, description } = request.body;

      if (!title) {
        return response.writeHead(400).end(JSON.stringify("Title is required"));
      }

      if (!description) {
        return response
          .writeHead(400)
          .end(JSON.stringify("Description is required"));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return response.writeHead(201).end();
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (request, response) => {
      const { search } = request.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
              description: search,
            }
          : null
      );

      return response.end(JSON.stringify(tasks));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { id } = request.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return response.writeHead(404).end();
      }

      database.delete("tasks", id);

      return response.writeHead(204).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (request, response) => {
      const { title, description } = request.body;
      const { id } = request.params;

      if (!title || !description) {
        return response
          .writeHead(404)
          .end("Title or Description must be filled");
      }

      const [task] = database.select("tasks", { id });

      if (!task) {
        return response.writeHead(404).end();
      }

      database.update("tasks", id, {
        ...task,
        title: title ?? task.title,
        description: description ?? task.description,
        updated_at: new Date(),
      });

      return response.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (request, response) => {
      const { id } = request.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return response.writeHead(404).end();
      }

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update("tasks", id, { ...task, completed_at });

      return response.writeHead(204).end();
    },
  },
];
