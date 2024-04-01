import {config} from "../../Utils/config.js";
const friendsService = {
    addFriend(token, username) {
        return fetch(`${config.API_ENDPOINT}/api/friends/sendRequest`, {
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
    },

    listFriendRequests(token) {
        return fetch(`${config.API_ENDPOINT}/api/friends/listRequest`, {
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
    },

    acceptFriendRequest(token, username) {
        return fetch(`${config.API_ENDPOINT}/api/friends/acceptRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assurez-vous que le token est envoyé correctement pour authentification
            },
            body: JSON.stringify({ token,username }) // Envoyez le nom d'utilisateur de la personne qui a envoyé la demande
        }).then(response => response.json());
    },

    rejectFriendRequest(token, username) {
        return fetch(`${config.API_ENDPOINT}/api/friends/rejectRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assurez-vous que le token est envoyé correctement pour authentification
            },
            body: JSON.stringify({ token,username }) // Envoyez le nom d'utilisateur de la personne qui a envoyé la demande
        }).then(response => response.json());
    },

    sendGameRequest(gameId, username, token) {
        return fetch(`${config.API_ENDPOINT}/api/friends/invite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gameId, username, token }) // Envoie les données nécessaires
        })
            .then(response => response.json());
    },

    acceptGameRequest(gameId, token) {
        return fetch(`${config.API_ENDPOINT}/api/friends/accept`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ gameId, token }) // Envoie les données nécessaires
        })
            .then(response => response.json());
    },

    getGameRequests(token) {
        return fetch(`${config.API_ENDPOINT}/api/friends/gameRequest`, {
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



export { friendsService};