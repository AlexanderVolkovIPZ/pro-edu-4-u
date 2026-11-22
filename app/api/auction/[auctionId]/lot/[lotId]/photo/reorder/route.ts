import { createMediaHandlers } from '@/server/http/handlers/media.handlers';

const handlers = createMediaHandlers('photo');

export const PATCH = handlers.PATCH_REORDER;
