#!/bin/bash

tty -s || exec konsole -e "$0" "$@"

sudo node ./main.js

read -n 1 -s -r -p "(Press any key to end)"
