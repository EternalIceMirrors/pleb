/**
 * Created by Will on 11/22/2016.
 */

const mod = require('../operators/mod');

function Ban(msg, args) {
    const op = new mod(msg.client, msg.member, msg.guild.member(msg.mentions.users.first()), args.slice(1).join(' '), msg.guild, msg.channel);
    return op.ban();
}

module.exports = {
    func: Ban,
    triggers: 'ban'
};