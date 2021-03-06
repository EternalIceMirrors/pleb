/**
 * Created by Will on 1/14/2017.
 */

const url = require('url');
const request = require('request');
const rp = require('request-promise-native').defaults({
    baseUrl: 'https://api.soundcloud.com',
    followAllRedirects: true,
    qs: {
        client_id: process.env.soundcloud
    },
    json: true
});
const moment = require('moment');

class Soundcloud {

    /**
     * @param {Playlist} list
     */
    constructor(list) {

        /**
         * @type {Playlist}
         */
        this.playlist = list;
    }

    /**
     * Add command arguments to the playlist.
     * @param {Array} args
     * @return {Playlist}
     */
    async add(args) {
        const urls = args.filter(e => Soundcloud.isViewURL(e));
        for(const resource of urls) await this._loadResource(resource);
        return this.playlist;
    }

    /**
     * Load a SoundCloud resource.
     * @param url
     * @return {Promise}
     * @private
     */
    async _loadResource(url) {
        const thing = await rp.get({
            uri: 'resolve',
            qs: {
                url
            }
        });

        switch (thing.kind) {
            case 'playlist':
                return this._addPlaylist(thing);
            case 'track':
                return this._addTrack(thing);
        }
    }

    /**
     * Add a SoundCloud playlist resource to the playlist.
     * @param resource
     * @private
     */
    _addPlaylist(resource) {
        this.playlist.info = {
            title: resource.title,
            description: resource.description,
            thumbnail: resource.artwork_url,
            displayURL: resource.permalink_url,
            author: resource.user.username
        };

        for(const track of resource.tracks) this._addTrack(track);
    }

    /**
     * Add a SoundCloud track resource to the playlist.
     * @param track
     * @private
     */
    _addTrack(track) {
        if(!track.streamable) return;
        this.playlist.addSong({
            name: track.title,
            url: track.permalink_url,
            type: 'soundcloud',
            duration: moment.duration(track.duration).format('hh[h] mm[m] ss[s]'),
            thumbnail: track.artwork_url,
            stream: () => {
                return request.get({
                    uri: track.stream_url,
                    followAllRedirects: true,
                    qs: { client_id: process.env.soundcloud },
                    encoding: null
                });
            },
            author: track.user.username
        });
    }

    /**
     * Whether the given string is a valid URL form for resolving.
     * @param {String} testURL
     * @return {boolean}
     */
    static isViewURL(testURL) {
        const parsed = url.parse(testURL);
        if(!parsed.pathname || !parsed.hostname) return false;
        const parts = parsed.pathname.split('/');
        return (parsed.hostname === 'soundcloud.com' || parsed.hostname === 'www.soundcloud.com') && parts.length >= 2;
    }
}

module.exports = Soundcloud;