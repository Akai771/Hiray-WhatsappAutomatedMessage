import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
});
