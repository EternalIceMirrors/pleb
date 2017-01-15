/**
 * Created by Will on 1/14/2017.
 */

const url = require('url');
const rp = require('request-promise-native').defaults({
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    json: true,
    qs: {
        key: process.env.youtube
    }
});
const ytdl = require('ytdl-core');

const Soundcloud = require('./Soundcloud');
const Constants = {
    video: 'video',
    playlist: 'playlist',
    shortVideo: 'short video'
};

class Youtube   {

    /**
     * @constructor
     * @param {Playlist} list
     */
    constructor(list)   {

        /**
         * @type {Playlist}
         */
        this.playlist = list;
    }

    /**
     * Add command arguments to a playlists.  Automatically adds any non-url arguments and a query.
     * @param {Array} args
     * @return {Promise}
     */
    add(args)   {
        const urls = [];
        const query = args.filter(e => {
            if(Soundcloud.isViewURL(e)) return false;
            if(Youtube.isViewURL(e)) {
                urls.push(e);
                return false;
            }
            return true;
        }).join(' ');

        const resolved = [];
        resolved.push(this.loadTrackQuery(query));
        for(const resource of urls) {
            const type = Youtube.getType(resource);
            const id = Youtube.parseID(resource);

            let load;
            if(type === Constants.video || type === Constants.shortVideo) load = this.loadTrack(id);
            else if(type === Constants.playlist) load = this.loadPlaylist(id);

            resolved.push(load);
        }

        return Promise.all(resolved.filter(e => e));
    }

    /**
     * Load a query as a single video into the playlist.
     * @param {string} query
     * @return {Promise}
     */
    loadTrackQuery(query)   {
        if(!query) return Promise.resolve();
        return rp.get({
            uri: 'search',
            qs: {
                part: 'snippet',
                q: query,
                maxResults: 1,
                type: 'video'
            }
        }).then(res => {
            if(res.items.length === 0) return;
            return this.loadTrack(res.items[0].id.videoId);
        });
    }

    /**
     * Load a query as a playlist into the playlist.
     * @param {string} query
     * @return {Promise}
     */
    loadPlaylistQuery(query)    {
        if(!query) return Promise.resolve();
        return rp.get({
            uri: 'search',
            qs: {
                part: 'snippet',
                q: query,
                maxResults: 1,
                type: 'playlist'
            }
        }).then(res => {
            if(res.items.length === 0) return;
            return this.loadPlaylist(res.items[0].id.playlistId);
        });
    }

    /**
     * Load a YouTube playlist by ID into the playlist.
     * @param id
     * @param pageToken
     * @return {Promise}
     */
    loadPlaylist(id, pageToken = null) {
        return rp.get({
            uri: 'playlistItems',
            qs: {
                part: 'snippet',
                playlistId: id,
                maxResults: 50,
                pageToken: pageToken
            }
        }).then(res => {
            this._addPlaylist(res);
            if(res.nextPageToken) return this.loadPlaylist(id, res.nextPageToken);
            return this;
        });
    }

    /**
     * Load a YouTube track by ID into the playlist.
     * @param {string} id
     * @return {Promise}
     */
    loadTrack(id)  {
        return rp.get({
            uri: 'videos',
            qs: {
                part: 'liveStreamingDetails,snippet,contentDetails,id',
                id: id,
                maxResults: 1
            }
        }).then(res => {
            if(res.items.length === 0) return;
            return this._addTrack(res.items[0]);
        });
    }

    /**
     * Add a YouTube playlist resource into the playlist.
     * @param resource
     * @return {Promise.<*>}
     * @private
     */
    _addPlaylist(resource) {
        const tracks = [];
        for(const item of resource.items) tracks.push(this.loadTrack(item.snippet.resourceId.videoId));
        return Promise.all(tracks);
    }

    /**
     * Add a YouTube video resource into the playlist.
     * @param resource
     * @private
     */
    _addTrack(resource) {
        if(resource.liveStreamingDetails) return;
        this.playlist.addSong({
            name: resource.snippet.title,
            url: `https://youtu.be/${resource.id}`,
            duration: resource.contentDetails.duration,
            type: 'youtube',
            stream: () => {
                return ytdl(`https://www.youtube.com/watch?v=${resource.id}`, {
                    quality: 'lowest',
                    filter: 'audioonly'
                });
            }
        });
    }

    /**
     * Get the type of the URL.
     * @param {string} testURL
     * @return {string|null}
     */
    static getType(testURL) {
        const parsed = url.parse(testURL, true);

        if(parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com')  {
            if(parsed.pathname === '/watch' && !!parsed.query.v)            return Constants.video;
            else if(parsed.pathname === '/playlist' && !!parsed.query.list) return Constants.playlist;

            return null;
        }   else if(parsed.hostname === 'www.youtu.be' || parsed.hostname === 'youtu.be')   {
            return Constants.shortVideo;
        }
        return null;
    }

    /**
     * Find the ID of any YouTube URL.
     * @param testURL
     * @return {string|null}
     */
    static parseID(testURL) {
        const type = Youtube.getType(testURL);
        const parsed = url.parse(testURL, true);

        let toTest;
        switch (type)   {   /* eslint-disable indent */
            case Constants.video:
                toTest = parsed.query.v;
                break;
            case Constants.shortVideo:
                toTest = parsed.pathname.substring(1);
                break;
            case Constants.playlist:
                toTest = parsed.query.list;
                break;
        } /* esline-enable indent */

        return Youtube._testID(toTest);
    }

    /**
     * Whether the YouTube link is a front-end URL.
     * @param testURL
     * @return {boolean}
     */
    static isViewURL(testURL)   {
        return !!Youtube.parseID(testURL);
    }

    /**
     * Test a string whether it contains a YouTube ID pattern.
     * @param {string} string
     * @return {null|string}
     * @private
     */
    static _testID(string) {
        const idRegex = /[A-Za-z0-9_-]+/;
        return idRegex.test(string) ? string : null;
    }
}

module.exports = Youtube;