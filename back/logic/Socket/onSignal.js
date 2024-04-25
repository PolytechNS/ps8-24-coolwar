const OneSignal = require('@onesignal/node-onesignal');

async function sendNotification(message) {
    const ONESIGNAL_APP_ID = 'bc1f28b3-edce-43eb-88d4-6a9b1fb09860';
    const ONESIGNAL_API_KEY = 'NTQ1NjlhODEtYThlMS00NWNhLTg2MjMtN2NiZWNmZjk4ODUw';

    const app_key_provider = {
        getToken() {
            return ONESIGNAL_API_KEY;
        }
    };

    // Create a configuration for the OneSignal client
    const configuration = OneSignal.createConfiguration({
        authMethods: {
            app_key: {
                tokenProvider: app_key_provider
            }
        }
    });

    const client = new OneSignal.DefaultApi(configuration);

    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.included_segments = ['All'];
    notification.contents = {
        en: message
    };
    const {id} = await client.createNotification(notification);

    const response = await client.getNotification(ONESIGNAL_APP_ID, id);
    console.log("reponse de la notif envoyée : ");
    console.log(response);

}

module.exports = sendNotification;
