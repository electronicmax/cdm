#!/bin/bash

export CLIENT="../../../pywebbox/client.py"
export HOST="http://localhost:8211"
export USER="webbox"
export PASS="webbox"

echo "Prompt is for webbox db password."
echo "CDM box will be DROPPED."
psql --username=webbox --password postgres --host=localhost --command="DROP DATABASE wb_cdm"

python $CLIENT $HOST $USER $PASS create_box --box cdm
python $CLIENT $HOST $USER $PASS update --box cdm --version 0 --data family.json
python $CLIENT $HOST $USER $PASS add_file --box cdm --data david.jpg --id david.jpg --version 1 --contenttype "image/jpeg"
python $CLIENT $HOST $USER $PASS add_file --box cdm --data susan.png --id portrait-Susan__Smith --version 2 --contenttype "image/png"
python $CLIENT $HOST $USER $PASS add_file --box cdm --data michael.jpg --id portrait-Michael__Smith --version 3 --contenttype "image/jpg"
python $CLIENT $HOST $USER $PASS add_file --box cdm --data elizabeth.jpg --id portrait-Elizabeth__Smith --version 4 --contenttype "image/jpg"



