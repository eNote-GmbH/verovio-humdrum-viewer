docker build -t vhv .
docker run --name verovio-humdrum-viewer -p 80:4000 -dit vhv