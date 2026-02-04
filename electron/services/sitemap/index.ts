import { app } from 'electron';
import { createSitemapScheduler } from './scheduler';

let scheduler: ReturnType<typeof createSitemapScheduler> | null = null;

const initScheduler = () => {
  if (!scheduler) {
    scheduler = createSitemapScheduler(app.getPath('userData'));
  }
};

if (app.isReady()) {
  initScheduler();
} else {
  app.once('ready', initScheduler);
}
