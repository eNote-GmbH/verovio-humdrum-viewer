./stop_and_remove_server.sh
rm Gemfile.lock
docker build -t vhv .
docker run --name verovio-humdrum-viewer -p 80:4000 -dit vhv