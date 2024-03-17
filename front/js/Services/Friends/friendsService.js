import {config} from "../../Utils/config.js";
const friendsService = {
    addFriend(token, username) {
        return fetch(`${config.API_ENDPOINT}/api/friends/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}` // Envoie le token dans l'en-tête Authorization
            },
            body: JSON.stringify({ token,username }) // Envoie le nom d'utilisateur de l'ami dans le corps de la requête
        })
            .then(response => response.json());
    },

    listFriends(token) {
        return fetch(`${config.API_ENDPOINT}/api/friends/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },

        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    }

}



export { friendsService };