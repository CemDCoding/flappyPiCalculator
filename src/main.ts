import './styles/base.css';
import { createApp } from './app/controller';
import { pickStorage } from './app/memoryStorage';
import { calcEngine } from './calc';
import { createLeaderboard } from './leaderboard';
import { createCalculatorView } from './ui';

const root = document.getElementById('app');
if (!root) {
  throw new Error('#app not found');
}
// Accessing localStorage can throw (privacy settings); then fall back to memory.
const storage = pickStorage(() => window.localStorage);
createApp({
  view: createCalculatorView(root),
  calc: calcEngine,
  leaderboard: createLeaderboard(storage),
});
