import type { ProjectPayload } from "./project-upsert";
import { advlink } from "./payloads/advlink";
import { zerochat } from "./payloads/zerochat";
import { babyday } from "./payloads/babyday";
import { requestOrchestratorApi } from "./payloads/request-orchestrator-api";
import { coffeeDelivery } from "./payloads/coffee-delivery";
import { cartinhasGg } from "./payloads/cartinhas-gg";
import { adrianoCostaSite } from "./payloads/adriano-costa-site";
import { zeromail } from "./payloads/zeromail";
import { zerowork } from "./payloads/zerowork";
import { zeromovie } from "./payloads/zeromovie";
import { zerofinance } from "./payloads/zerofinance";
import { tunify } from "./payloads/tunify";
import { aiVideoCuts } from "./payloads/ai-video-cuts";

export const projectPayloads: ProjectPayload[] = [
  advlink,
  zerochat,
  babyday,
  requestOrchestratorApi,
  coffeeDelivery,
  cartinhasGg,
  adrianoCostaSite,
  zeromail,
  zerowork,
  zeromovie,
  zerofinance,
  tunify,
  aiVideoCuts,
];
