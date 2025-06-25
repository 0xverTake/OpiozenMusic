#!/bin/bash
echo "Starting Lavalink server..."
cd "$(dirname "$0")/lavalink"
java -jar Lavalink.jar
