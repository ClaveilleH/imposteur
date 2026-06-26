import type { FastifyInstance } from 'fastify';
import type { Container } from '../../../container';
import { createGameSchema } from '../schemas';
import { toGameAssignmentDTO } from '../../../application/dto/game.dto';

/**
 * Création de partie. V1 : stateless — on renvoie l'attribution complète,
 * que le frontend exploite pour la distribution des cartes et le vote.
 */
export function gameRoutes(container: Container) {
  return async function (app: FastifyInstance): Promise<void> {
    app.post('/games', async (request, reply) => {
      const body = createGameSchema.parse(request.body);
      const assignment = await container.gameService.createGame(body);
      reply.status(201);
      return { game: toGameAssignmentDTO(assignment) };
    });
  };
}
