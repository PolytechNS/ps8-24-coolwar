import {GamePresenter} from './Game/GamePresenter.js';
import {actionGameService} from "./Services/actionGameService.js";
import {GameView} from './Game/GameView.js';
import {AuthService} from './services/AuthService.js';
import {socketManager} from './socket/socketManager.js';

import {AuthService} from '../js/Services/authService.js';

document.getElementById('login-button').addEventListener('click', AuthService.getLoginPage());

