#!/bin/bash

# Kill NodeJS, if necessary
NODE_PID=$(ps -fu $USER| grep "nodejs" | grep -v "grep" | awk '{print $2}')

if [[ -n "$NODE_PID" ]]; then
    echo "Stopping NodeJS..."
    kill "$NODE_PID"
fi

# Start NodeJS
NODE_ENV=production nodejs server.js &

# Wait starting NodeJS
sleep 4s
