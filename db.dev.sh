#!/bin/bash

DIR="./pgdata"
if [ ! -d "$DIR" ]; then
  echo "Creating directory ${DIR}..."
  mkdir pgdata
fi

docker compose up -d