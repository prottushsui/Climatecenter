#!/bin/bash
# Script to install client dependencies

echo "Installing client dependencies..."
cd /workspace/client
npm install

if [ $? -eq 0 ]; then
    echo "Client dependencies installed successfully!"
else
    echo "Error installing client dependencies"
    exit 1
fi