import {createApp} from './app';
import {readEnvironment} from './application/dto/environment';
import {logger} from './infrastructure/logging/logger';

const environment = readEnvironment();
const app = createApp();

app.listen(environment.port, () => {
  logger.info('Backend server started', {
    port: environment.port,
    nodeEnv: environment.nodeEnv,
  });
});
