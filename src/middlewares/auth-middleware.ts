import { FastifyReply, FastifyRequest } from "fastify";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.headers["x-user-id"];

  if (!userId) {
    return reply.status(401).send({
      message: "Unauthorized",
    });
  }

  request.userId = userId as string;
}
