var IMCoop = IMCoop || {};

IMCoop.youtube = (function() {
  /**
   * Private.
   */
  var searchFn,
      stripPTMSFn,
      params,
      atts,
      ytplayer;

  // Search for a specified string.
  searchFn = function(term, callback) {
    // Search for the term.
    alf.publish('youtube:startSearch', term);
    gapi.client.youtube.search.list({
        q: term,
        part: 'id',
        maxResults: 10,
        type: 'video',
        videoEmbeddable: 'true'
      })
      .execute(function(response) {
        videoIds = response.result.items.map(function(item) { return item.id.videoId; } );

        // Get details for all the search results.
        gapi.client.youtube.videos.list({
            part: 'id,snippet,contentDetails',
            id: videoIds.join(',')
          })
          .execute(function(contentResp) {
            var searchResults = {};
            contentResp.result.items.forEach(function(item) {
              item.videoId = item.id;
              item.title = item.snippet.title;
              item.duration = stripPTMSFn(item.contentDetails.duration);
              searchResults[item.id] = item;
            });

            // Send indexed results back to callback.
            callback(searchResults);
          });
      });
  };

  /**
   * Turns the PT#M#S format to #:# format.
   * eg. PT15M20S to 15:20.
   */
  stripPTMSFn = function(str) {
    return str.replace(/P|T|S/g, '')
      .replace(/M|H/g,':')
      .replace(/^(\d):/, '0$1:')
      .replace(/:(\d):/, ':0$1:')
      .replace(/:(\d)$/, ':0$1');
  };

  params = {
    allowScriptAccess: 'always',
    wmode: 'opaque'
  };
  atts = {
    id: 'myytplayer',
    styleclass: 'video-player'
  };

  window.onYouTubePlayerReady = function(playerId) {
    ytplayer = document.getElementById('myytplayer');
    //console.log(ytplayer.getDuration(), ytplayer.getCurrentTime());
  };

  swfobject.embedSWF('http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=ytplayer&version=3&controls=0&showinfo=0&rel=0',
                     'ytapiplayer', '160', '90', '8', null, null, params, atts);

  /**
   * Public.
   */
  return {
    search: searchFn,

    play: function(videoId) {
      if (videoId) {
        ytplayer.stopVideo();
        ytplayer.loadVideoById(videoId);
      } else {
        ytplayer.playVideo();
      }
    },

    stop: function() {
      ytplayer.stopVideo();
    },

    pause: function() {
      ytplayer.pauseVideo();
    },

    seek: function(sex) {
      ytplayer.seekTo(sex);
    },

    getProps: function() {
      return {
        totalTime: Math.round(+ytplayer.getDuration()),
        currentTime: Math.round(+ytplayer.getCurrentTime())
      };
    }
  };
})();