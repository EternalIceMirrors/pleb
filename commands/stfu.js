/**
 * Created by Will on 8/25/2016.
 */

const storage = require('../storage/playlists');

/**
 * @param {Message} msg
 * @param {[]} args
 * @return {string|undefined}
 */
function Stfu(msg, args)    {
    const playlist = storage.get(msg.guild.id);
    if(playlist) playlist.destroy();
    msg.guild.voiceConnection.disconnect();
    return 'k 😢';
}

module.exports = {
    func: Stfu,
    triggers: [
        'stfu',
        'stop',
        'leave'
    ],
    validator: msg => {
        return !!(msg.guild && msg.guild.voiceConnection)
    }
};
