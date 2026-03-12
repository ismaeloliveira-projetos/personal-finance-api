import { FastifyInstance } from "fastify";
import { z } from "zod";

import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

export async function transactionRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authMiddleware);

  // ================================
  // CREATE TRANSACTION
  // ================================
  app.post("/transactions", async (request) => {
    const bodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["INCOME", "EXPENSE"]),
      category: z.string().optional(),
    });

    const { title, amount, type, category } = bodySchema.parse(request.body);

    const transaction = await prisma.transaction.create({
      data: {
        title,
        amount,
        type,
        category,
        userId: request.userId,
      },
    });

    return transaction;
  });

  // ================================
  // LIST TRANSACTIONS (PAGINATION + FILTER)
  // ================================
  app.get("/transactions", async (request) => {
    const querySchema = z.object({
      page: z.coerce.number().default(1),
      perPage: z.coerce.number().default(10),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const { page, perPage, startDate, endDate } = querySchema.parse(
      request.query,
    );

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: request.userId,
        createdAt: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: "desc",
      },
    });

    return transactions;
  });

  // ================================
  // GET ONE TRANSACTION
  // ================================
  app.get("/transactions/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    return transaction;
  });

  // ================================
  // UPDATE TRANSACTION
  // ================================
  app.put("/transactions/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const bodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["INCOME", "EXPENSE"]),
      category: z.string().optional(),
    });

    const { id } = paramsSchema.parse(request.params);
    const data = bodySchema.parse(request.body);

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
    });

    return transaction;
  });

  // ================================
  // DELETE TRANSACTION
  // ================================
  app.delete("/transactions/:id", async (request) => {
    const paramsSchema = z.object({
      id: z.string(),
    });

    const { id } = paramsSchema.parse(request.params);

    await prisma.transaction.delete({
      where: { id },
    });

    return {
      message: "Transaction deleted successfully",
    };
  });

  // ================================
  // FINANCIAL SUMMARY
  // ================================
  app.get("/summary", async (request) => {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: request.userId,
      },
    });

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  });

  // ================================
  // LIST CATEGORIES
  // ================================
  app.get("/categories", async (request) => {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: request.userId,
      },
      select: {
        category: true,
      },
    });

    const categories = [
      ...new Set(transactions.map((t) => t.category).filter(Boolean)),
    ];

    return categories;
  });
}
