# Dropbox Music Player

Super simple, responsive static-site music player that can stream music from Dropbox folders, using only HTML and Javascript.

Online demo: https://music.sitosis.com

![Screenshot](http://i.imgur.com/pcoP8aL.png)

## Status

Can be used to list and play albums on Dropbox as long as they're stored correctly.

## Expected Music Storage Format

After logging in, you specify a root directory in which to scan for music (for example, `/Music`). The application expects you to store `mp3` or `ogg` files in "album" folders within the root directory that you specified. Subfolders within album folders will not be scanned, unless the containing folder's name starts with an underscore. If there are any image files in an album directory (`png` or `jpg`), the first one found will be used as the background image behind the player when playing that album.

For example, consider the following file structure:

```
Music/
|
+-- Bal Sagoth - Starfire Burning Upon the Ice-Veiled Throne of Ultima Thule/
|   |
|   +-- 01 Black Dragons Soar Above the Mountain of Shadows (Prologue).ogg
|   +-- 02 To Dethrone the Witch-Queen of Mythos K'unn (The Legend of the Battle of Blackhelm Vale).ogg
|   +-- 03 As the Vortex Illumines the Crystalline Walls of Kor-Avul-Thaa.ogg
|   +-- Folder.jpg
|
+-- John R. Butler - Surprise/
|   |
|   +-- 01 Yodel in Reverse.mp3
|   +-- 02 Hyphenated Name.mp3
|   +-- 03 Holiday Play.mp3
|   +-- Cover.jpg
|   |
|   +-- Best of College A Cappella 1995/
|       |
|       +-- 01 Everything She Wants.mp3
|       +-- 02 Soul to Squeeze.mp3
|       +-- 03 This Woman's Work.mp3
|       +-- Cover.png
|       
+-- _Soundtracks/
    |
    +-- John Williams - Jurassic Park/
        |
        +-- 01 Opening Titles.ogg
        +-- 02 Theme from Jurassic Park.ogg
        +-- 03 Incident at Isla Nublar.ogg
```

In the above example, the Bal Sagoth and John R. Butler albums are in the root `/Music` directory and therefore will be found and listed. The Best of College A Cappella album is located within a subdirectory, and therefore will be missed. You should move it out into the root `/Music` directory for it to start working. The Jurassic Park soundtrack is inside a folder that starts with an underscore (`/Music/_Sountracks`), and therefore it will be found and listed; it does not have any image files though, so no cover art would be displayed while playing it.

## Installing and Running

```
$ git clone https://github.com/rudism/dropbox-music-player.git
$ cd dropbox-music-player
$ cp config.json.example static/config.json
```

At this point, you should edit `static/config.json` and put in your Dropbox app key. You can create a new app with an app key by visiting https://www.dropbox.com/developers.

Then you can build using `gulp`:

```
$ npm install
$ gulp
```

To run, configure your webserver to serve the files in `dropbox-music-player/public`.

You can also run it locally using the gulp `connect` task, then point your browser to `http://localhost:9002`:

```
$ gulp connect
```
