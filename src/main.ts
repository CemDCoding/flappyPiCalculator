import './styles/base.css';
import { createApp } from './app/controller';
import { calcEngine } from './calc';
import { createCalculatorView } from './ui';

const root = document.getElementById('app');
if (!root) {
  throw new Error('#app not found');
}
createApp({ view: createCalculatorView(root), calc: calcEngine });
