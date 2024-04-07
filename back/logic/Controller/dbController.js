const { generateToken } = require('../Authentification/authentication');

class dbController {
    static async populateDb(db) {
        // Peuplement des skins
        const skins = [
            { _id: 'defaultSkin', name: 'Standard', imagePath: '/skins/standard.png', description: 'Le skin standard.' },
            { _id: 'goldSkin', name: 'Or', imagePath: '/skins/gold.png', description: 'Brillez avec ce skin doré.' },
            { _id: 'silverSkin', name: 'Argent', imagePath: '/skins/silver.png', description: 'Un éclat argenté sur le plateau.' }
        ];
        for (const skin of skins) {
            await db.collection('skins').updateOne({ _id: skin._id }, { $setOnInsert: skin }, { upsert: true });
        }

        // Peuplement des titles
        const titles = [
            { _id: 'speedMaster', name: 'Maître de la Rapidité', description: 'Gagné pour avoir remporté 10 parties en moins de 5 minutes.' },
            { _id: 'strategist', name: 'Stratège', description: 'Pour les penseurs profonds et les planificateurs minutieux.' }
        ];
        for (const title of titles) {
            await db.collection('titles').updateOne({ _id: title._id }, { $setOnInsert: title }, { upsert: true });
        }

        // Peuplement des achievements
        const achievements = [
            { _id: 'first_win.png', name: 'Première Victoire', description: 'Gagner votre première partie de Quoridor.', imagePath: 'achievements/first_win.png' },
            {_id: "tu_fais_le_fou.jpg", name: "Tu fais le fou", description: "Gagner une partie en utilisant 10 murs", imagePath: "achievements/tu_fais_le_fou.jpg"},
            { _id: 'quoridorMaster', name: 'Maître de Quoridor', description: 'Gagner 100 parties de Quoridor.', imagePath: 'achievements/maitre_quoridor.png' },
            {_id : "speedMaster", name: "Maître de la Rapidité", description: "Gagner 10 parties en moins de 5 minutes", imagePath: "achievements/speed_master.png"},
            {_id : "strategist", name: "Stratège", description: "Gagner 10 parties en plus de 15 minutes", imagePath: "achievements/strategic_genius.png"},
            {_id : "wallMaster", name: "Maître des Murs", description: "Gagner 10 parties en bloquant l'adversaire avec un mur", imagePath: "achievements/fortress_defender.png"},
            {_id : "pathMaster", name: "Maître des Chemins", description: "Gagner 10 parties en bloquant l'adversaire avec votre pion", imagePath: "achievements/pathfinder.png"},
            {_id : "quickThinker", name: "Penseur Rapide", description: "Gagner 10 parties en moins de 10 minutes", imagePath: "achievements/quick_thinker.png"},
            {_id : "moonWalker", name: "MoonWalk d'MJ", description: "Gagner 10 parties en sautant par-dessus l'adversaire", imagePath: "achievements/moonwalk.png"},
        ];
        for (const achievement of achievements) {
            await db.collection('achievements').updateOne({ _id: achievement._id }, { $setOnInsert: achievement }, { upsert: true });
        }

        // Peuplement des emotes
        const emotes = [
            { _id: 'happyEmote', name: 'Heureux', imagePath: '/emotes/happy.png', description: 'Montrez votre joie avec cette emote.' },
            { _id: 'sadEmote', name: 'Triste', imagePath: '/emotes/sad.png', description: 'Exprimez votre tristesse.' }
        ];
        for (const emote of emotes) {
            await db.collection('emotes').updateOne({ _id: emote._id }, { $setOnInsert: emote }, { upsert: true });
        }

        //random users
        let profilesPictures = ["profile0", "profile1","profile2","profile3","profile4","profile5","profile6","profile7"]

        const users = [
            {
                username: 'AlexDuPont',
                token: generateToken('AlexDuPont'),
                password: 'password123', // À hasher dans une application réelle
                lvl: 12,
                exp: 2400,
                elo: 1500,
                wins: 24,
                losses: 18,
                trophies: 3,
                skins: { current: 'perso8', owned: ['defaultSkin', 'goldSkin'] },
                emotes: ['happyEmote'],
                titles: [],
                achievements: ['first_win.png', 'tu_fais_le_fou.jpg'],
                profilePicture: 'profile2',
            },
            {
                username: 'BellaCiao',
                token: generateToken('BellaCiao'),
                password: 'secretPass', // À hasher dans une application réelle
                lvl: 20,
                exp: 5000,
                elo: 1650,
                wins: 50,
                losses: 25,
                trophies: 5,
                skins: { current: 'perso7', owned: ['defaultSkin', 'silverSkin', 'goldSkin'] },
                emotes: ['sadEmote'],
                titles: ['speedMaster'],
                achievements: ['first_win.png', 'speedMaster'],
                profilePicture: 'profile4',
            },
            {
                username: 'BisTass12',
                token: generateToken('CharlieVibes'),
                password: 'vibes1234', // À hasher dans une application réelle
                lvl: 5,
                exp: 800,
                elo: 1200,
                wins: 8,
                losses: 12,
                trophies: 1,
                skins: { current: 'perso5', owned: ['defaultSkin', 'silverSkin'] },
                emotes: ['happyEmote'],
                titles: [],
                achievements: ['first_win.png'],
                profilePicture: 'profile1',
            },
            {
                username: 'CharlieVibes',
                token: generateToken('CharlieVibes'),
                password: 'vibes1234', // À hasher dans une application réelle
                lvl: 5,
                exp: 800,
                elo: 1200,
                wins: 8,
                losses: 12,
                trophies: 1,
                skins: {current: 'silverSkin', owned: ['defaultSkin', 'silverSkin']},
                emotes: ['happyEmote'],
                titles: [],
                achievements: ['first_win.png'],
                profilePicture: 'profile1',
            }
        ];



// Code pour insérer ces utilisateurs dans la base de données
        for (const user of users) {
            const existingUser = await db.collection('users').findOne({ username: user.username });

            if (!existingUser) {
                await db.collection('users').insertOne(user);
            }
        }


        console.log('Database populated with initial data!');
    }
}

module.exports = { dbController };
