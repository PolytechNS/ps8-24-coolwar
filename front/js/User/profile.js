import {socketManager} from "../Socket/socketManager.js";
import {userService} from "../Services/User/userService.js";


document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    if (!socketManager.isSocketInitialized(token)) {
        socketManager.initializeSocket(token);
    }
    if (token) {
        userService.getUserInfo((userInfo) => {
            console.log("PROFILE USER info", userInfo);

        });
    } else {
        console.error("No token found. Please log in.");
    }
});
