import { createMediaHandlers } from '@/server/http/handlers/media.handlers';

const handlers = createMediaHandlers('video');

export const PATCH = handlers.PATCH_REORDER;
