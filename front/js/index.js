import { GamePresenter } from './Game/GamePresenter.js';
import { GameModel } from './Game/GameModel.js';
import { GameView } from './Game/GameView.js';

document.addEventListener("DOMContentLoaded", () => {
    const model = new GameModel();
    const view = new GameView();
    const presenter = new GamePresenter(model, view);


});
