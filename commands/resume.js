/**
 * Created by Will on 8/30/2016.
 */
function Resume(client, msg, args)  {
    const playlist = msg.guild.playlist;
    if(playlist)    {
        playlist.resume();
    }   else    {
        msg.reply('nothing to resume, you idiot. :unamused:');
    }
    return Promise.resolve();
}

module.exports = Resume;