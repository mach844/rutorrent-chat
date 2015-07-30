# Introduction #

Here you can find information on how to install the chat plugin. Of course you need [rutorrent](http://code.google.com/p/rutorrent/) before you install this plugin. If you want to know more about the functionalities of this plugin you can look on the [overview](http://code.google.com/p/rutorrent-chat/wiki/Overview) page.


## Details ##

**Note:** to download/edit files in your web directory you most likely need either _**root**_ or _**sudo**_. Also your web directory and web user might differ from this guide.

### Installation ###

move to your rutorrent plugins directory:
```
cd /var/www/rutorrent/plugins/
```

download the plugin from SVN:
```
svn checkout http://rutorrent-chat.googlecode.com/svn/trunk/ chat
```

**or** download the plugin tarball and unpack it (make sure to check for the latest version on the [downloads](http://code.google.com/p/rutorrent-chat/downloads/list) page):
```
wget http://rutorrent-chat.googlecode.com/files/chat-2.0.tar.gz
tar -zxf chat-2.0.tar.gz
rm chat-2.0.tar.gz
```

and change the ownership of the files to your web user:
```
chown -R www-user:www-user chat/
```


### Configuration ###

If you want to change some of the configuration you can open up **conf.php** in your favorite editor (nano or vim or something similar) and there are the default options for all users. The comments above the setting should explain what it's for and what you can enter. Users can later override these with their own preferences through the settings menu as described on the [overview](http://code.google.com/p/rutorrent-chat/wiki/Overview) page.


### Finished ###

You can now start using the plugin!