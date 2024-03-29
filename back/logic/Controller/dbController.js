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
            { _id: 'firstWin', name: 'Première Victoire', description: 'Gagner votre première partie de Quoridor.', imagePath: '/achievements/firstWin.png' },
            { _id: 'quoridorMaster', name: 'Maître de Quoridor', description: 'Gagner 100 parties de Quoridor.', imagePath: '/achievements/quoridorMaster.png' }
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

        console.log('Database populated with initial data!');
    }
}

module.exports = { dbController };
