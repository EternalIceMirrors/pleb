const express = require('express');
const passport = require('passport');
const Discord = require('../util/Discord');
const router = express.Router();

router.use((req, res, next) => {
    if(req.user) next();
    else res.redirect('/auth/login');
});

router.get('/', async (req, res) => {
    const shard = req.app.get('shard');
    const guilds = (await req.user.request.guilds()).filter(g => (g.permissions & (1 << 5)) === 1 << 5);

    const memberOf = (await shard.broadcastEval(`this.guilds.filter(g => g.members.has('${req.user.id}')).array()`)).reduce((p, c) => p.concat(c));
    const guildsData = new Map();
    for(const g of memberOf)
        guildsData.set(g.id, g);

    res.render('dashboard/index', {
        guilds,
        guildsData
    });
});

module.exports = router;