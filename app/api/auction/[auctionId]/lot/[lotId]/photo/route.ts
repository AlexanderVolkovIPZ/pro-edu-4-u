import { createMediaHandlers } from '@/server/http/handlers/media.handlers';

const handlers = createMediaHandlers('photo');

export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
