/** A worker entry point that serves viewsheds to the thread that started it. */
import { serveViewsheds, type MessagePortLike } from "./viewshedService";

serveViewsheds(self as unknown as MessagePortLike);
