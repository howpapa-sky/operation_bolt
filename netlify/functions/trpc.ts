import { Handler } from "@netlify/functions";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export const handler: Handler = async (event, context) => {
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body,
    } as any;

    const res = {
      statusCode: 200,
      headers: {},
      body: "",
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(data: any) {
        this.body = JSON.stringify(data);
        this.headers["Content-Type"] = "application/json";
        return this;
      },
      send(data: any) {
        this.body = typeof data === "string" ? data : JSON.stringify(data);
        return this;
      },
      setHeader(name: string, value: string) {
        this.headers[name] = value;
      },
      end() {
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body,
        });
      },
    } as any;

    app(req, res);
  });
};
