var client, destroy, displayError, displayed, getUrlData, handleDropboxError, init, loadAlbum, loading, readAlbums, signedIn, signedOut, stopPlaying;
var kevin = 'test';
client = null;

$.expr[':'].containsic = function(a, i, m) {
  return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
};

$(document).ready(function() {
  $('.signedin').hide();
  $.getJSON('config.json', function(data) {
    client = new Dropbox.Client({
      key: data.dropbox_key
    });
    return client.authenticate({
      interactive: false
    }, function(error, client) {
      if (error != null) {
        handleDropboxError(error);
      }
      if (client.isAuthenticated()) {
        signedIn();
        return init();
      } else {
        return $('#signin').show();
      }
    });
  });
  $('#signout a').click(function() {
    return client.signOut(function(error) {
      if (error != null) {
        return handleDropboxError(error);
      }
      signedOut();
      return false;
    });
  });
  $('#signin a').click(function() {
    client.authenticate(function(error, client) {
      if (error != null) {
        return handleDropboxError(error);
      }
      signedIn();
      return init();
    });
    return false;
  });

  $('#getBookmark').click(function() {

  });

  $('#settingslink').click(function() {
    loading(true);
    return $.get('settings.html', function(data) {
      bootbox.dialog({
        title: 'Settings',
        message: data,
        buttons: {
          "Save": {
            className: 'btn-success',
            callback: function() {
              localStorage.setItem('musicpath', $('#musicpath').val());
              localStorage.setItem('scansubs', $('#scansubs').val());
              localStorage.setItem('ignoredirs', $('#ignoredirs').val());
              return init();
            }
          },
          "Cancel": {
            className: 'btn-default'
          }
        }
      });
      $('#musicpath').val(localStorage.getItem('musicpath'));
      $('#scansubs').val(localStorage.getItem('scansubs'));
      $('#ignoredirs').val(localStorage.getItem('ignoredirs'));
      return loading(false);
    });
  });
  $('#togglealbums').click(function() {
    return $('#wrapper').toggleClass('toggled');
  });
  return $('#search').change(function() {
    var filter;
    filter = $(this).val();
    if (filter === '') {
      return $('#albums').find('li').show();
    } else {
      $('#albums').find('a:containsic(' + filter + ')').parent().show();
      return $('#albums').find('a:not(:containsic(' + filter + '))').parent().hide();
    }
  }).keyup(function() {
    return $(this).change();
  });
});

handleDropboxError = function(error) {
  switch (error.status) {
    case Dropbox.ApiError.INVALID_TOKEN:
      signedOut();
      return displayError('Dropbox Error', "Your authentication token has expired. Please sign in again.");
    case Dropbox.ApiError.NOT_FOUND:
      return displayError('Dropbox Error', "The specified path was not found.");
    case Dropbox.ApiError.RATE_LIMITED:
      return displayError('Dropbox Error', "You've exceeded your API rate limit, try again later.");
    case Dropbox.ApiError.NETWORK_ERROR:
      return displayError('Dropbox Error', "There was a network error, check your internet connection.");
    default:
      return displayError('Dropbox Error', "An unexpected error occurred. Please refresh the page and try again.");
  }
};

displayed = false;

displayError = function(title, message) {
  if (!displayed) {
    displayed = true;
    loading(false);
    bootbox.alert({
      title: title,
      message: message,
      callback: function() {
        bootbox.hideAll();
        return displayed = false;
      }
    });
  }
  return false;
};

signedIn = function() {
  $('#signin').hide();
  $('#signout').show();
  $('.signedin').show();
  return client.getAccountInfo(function(error, accountInfo) {
    if (error != null) {
      return handleDropboxError(error);
    }
  });
};

signedOut = function() {
  $('#signout').hide();
  $('#signin').show();
  $('.signedin').hide();
  return destroy();
};

stopPlaying = function() {
  var ref, ref1;
  $('#page-content-wrapper').css('background-image', 'url("generic.png")');
  if ((ref = $('#player').data('bbplayer')) != null) {
    if ((ref1 = ref.bbaudio) != null) {
      ref1.pause();
    }
  }
  $('#player').hide().empty();
  $('#dummyplayer').show();
  return $('#songs ul').empty();
};

init = function() {
  var root;
  stopPlaying();
  $('#albums').empty();
  root = localStorage.getItem('musicpath');
  $('#musicpath').val(root);
  if (root == null) {
    return $('#settingslink').click();
  } else {
    loading(true);
    return readAlbums(root).then(function() {
      return loading(false);
    });
  }
};

destroy = function() {
  stopPlaying();
  $('#albums').empty();
  $('#search').val('');
  return client.reset();
};

readAlbums = function(path) {
  return new Promise(function(resolve, reject) {
    var subs;
    subs = [];
    return client.readdir(path, function(error, entries, dir, contents) {
      var album, entry, ignoredirs, j, len, scansubs;
      if (error != null) {
        handleDropboxError(error);
        resolve();
      }
      scansubs = localStorage.getItem('scansubs');
      ignoredirs = localStorage.getItem('ignoredirs');
      if (contents != null) {
        for (j = 0, len = contents.length; j < len; j++) {
          entry = contents[j];
          if (entry.isFolder) {
            if ((scansubs != null) && scansubs !== '' && entry.name.match(new RegExp(scansubs, 'i'))) {
              subs.push(readAlbums(path + '/' + entry.name));
            } else if ((ignoredirs == null) || ignoredirs === '' || !entry.name.match(new RegExp(ignoredirs, 'i'))) {
              album = $('<a href="#">').attr('data-path', path + '/' + entry.name).html(entry.name).click(function() {
                $('#albums li').removeClass('active');
                $(this).parent('li').addClass('active');
                return loadAlbum($(this).attr('data-path'));
              });
              $('#albums').append($('<li>').append(album));
            }
          }
        }
      }
      if (subs.length > 0) {
        return P.all(subs).then(function() {
          return resolve();
        });
      } else {
        return resolve();
      }
    });
  });
};

loadAlbum = function(album) {
  loading(true);
  stopPlaying();
  client.readdir(album, function(error, entries) {
    if (error != null) {
      return handleDropboxError(error);
    }
    return $.get('player.html', function(data) {
      var entry, j, len, makeUrls;
      $('#player').html(data);
      $('#player').find('.bb-album').html(album);
      makeUrls = [];
      for (j = 0, len = entries.length; j < len; j++) {
        entry = entries[j];
        if (entry.match(/\.(mp3|ogg|m4a|jpg|png)$/i)) {
          makeUrls.push(getUrlData(album, entry));
        }
      }
      return Promise.all(makeUrls).then(function(urlData) {
        var bbplayer, coverset, k, len1, source, track;
        track = 0;
        coverset = false;
        for (k = 0, len1 = urlData.length; k < len1; k++) {
          data = urlData[k];
          if (data.name.match(/\.(mp3|ogg|m4a)$/i)) {
            source = $('<source>').attr('src', data.url);
            source.attr('data-album', album);
            $('#playlist').append(source);
            $('#songs ul').append($('<li>').append($('<a href="#">').attr('data-track', track++).html(data.name).click(function() {
              $('#player').data('bbplayer').loadTrack($(this).attr('data-track'));
              $('#player').data('bbplayer').bbaudio.play();
              return false;
            })));
          } else if (!coverset && data.name.match(/\.(jpg|png)$/i)) {
            $('#page-content-wrapper').css('background-image', 'url("' + data.url + '")');
            coverset = true;
          }
        }
        $('#dummyplayer').hide();
        $('#player').show();
        bbplayer = new BBPlayer($('#player .bbplayer')[0]);
        $('#player').data('bbplayer', bbplayer);
        loading(false);
        return $('#player').data('bbplayer').bbaudio.play();
      }).error(function(e) {
        return console.log(e.message);
      });
    });
  });
  return false;
};

getUrlData = function(album, name) {
  return new Promise(function(resolve, reject) {
    var path;
    path = album + '/' + name;
    return client.makeUrl(path, {
      download: true
    }, function(error, urlData) {
      if (error != null) {
        handleDropboxError(error);
        return reject(new Error());
      } else {
        return resolve({
          name: name,
          url: urlData.url
        });
      }
    });
  });
};

loading = function(show) {
  if (show) {
    return $('#loader').show();
  } else {
    return $('#loader').hide();
  }
};
