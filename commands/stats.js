/**
 * Created by Will on 9/24/2016.
 */

const moment = require('moment');

function Status(client, msg, args)  {
    let reply;
    if(args[0] === 'guilds' && msg.author.id == '116690352584392704')    {
        reply = client.guilds.map(function(guild)    {
                return (guild.available ? ":white_check_mark:" : ":x:") + " **" + guild.name + "** - `" + guild.members.size + "` members - `" + guild.owner.user.username + "#" + guild.owner.user.discriminator + "`";
            }).join("\n");
    }   else    {
        reply = "**Guilds:** " + client.guilds.size + "\n" +
            "**Channels:** " + client.channels.size + "\n" +
            "**Start time:** " + moment(client.readyTime).format("MMMM D, YYYY, h:mm:ss a") + "\n" +
            "**Users:** " + client.users.size;
    }

    msg.channel.sendMessage(reply);
}

module.exports = Status;