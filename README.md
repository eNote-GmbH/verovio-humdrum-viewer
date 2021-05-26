# Enote Verovio Editor

Enote Verovio Editor is a simplistic score editor based on the Verovio Humdrum Viewer. It's different in the following ways:

- It does not support Humdrum
- It uses our custom-built verovio-toolkit.js version
- It allows to drag-and-drop MusicXML and MEI files into the editor and converts MusicXML automatically to MEI (unless deactivated)
- It is automatically deployed to https://verovio.dev.enote.com

## Testing and debugging locally

For running the application locally, make sure that you have the prerequisites installed as described [here](http://doc.verovio.humdrum.org/myvhv/local/). This includes:

- ruby (ideally in a [ruby-env](https://stackoverflow.com/a/36485498/448357))
- jekyll

To install the required ruby components, run `bundle install`.

To start the server, run `./.serve-local`

To debug, you can use an IDE like PyCharm, create a launch configuration for JavaScript Debug, and enter the URL http://0.0.0.0:4000 when starting your browser. Now breakpoints should be hit directly in your IDE.

## Troubleshooting
When encountering [encoding problems](https://stackoverflow.com/questions/7165108/in-os-x-lion-lang-is-not-set-to-utf-8-how-to-fix-it) with the locale, try

```shell
export LC_ALL=en_US.UTF-8  
export LANG=en_US.UTF-8
```

before running

```shell
rbenv install 2.7.2 
rbenv global 2.7.2 
rbenv init
gem install --user-install bundler jekyll 
```

## Original README:
[VHV](http://verovio.humdrum.org) is an online
[Humdrum](http://www.humdrum.org) file notation editor and renderer that uses
the [verovio](http://verovio.org) typesetting engine for generating graphical notation, the 
[ace text editor](https://ace.c9.io) for editing the score text, and
[humlib](http://humlib.humdrum.org) for digital score processing in the Humdrum file syntax.

* [Documenation for VHV](http://doc.verovio.humdrum.org)
* [Maintenance documentation for VHV](http://doc.verovio.humdrum.org/maintenance/newpage)
* [Presentation of VHV at the Music Encoding Conference, Tours, France 2017](http://bit.ly/mec2017-vhv)

