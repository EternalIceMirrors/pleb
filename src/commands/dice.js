/**
 * Created by Will on 11/1/2016.
 */

exports.func = (res, msg, args, handler, options = {}) => {
    const count = parseInt(options.coinflip ? 1 : (args[0] || 2));
    const sides = parseInt(options.coinflip ? 2 : (args[1] || 6));

    if(count >= 1000) return res.error('Please use less than 1,000 dice.  kthxbye.');

    let sum = 0;
    for(let i = 0; i < count; i++) sum += Math.floor(Math.random() * sides) + 1;

    if(options.coinflip) return (sum === 1) ? 'heads' : 'tails';
    return res.success(`**${sum}** 🎲`);
};

exports.triggers = [
    'dice',
    'roll'
];
