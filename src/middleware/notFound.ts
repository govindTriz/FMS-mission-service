import { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ code: "NOT_FOUND", message: "Route not found" });
};
