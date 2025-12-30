#!/bin/sh

# Run the start:docker command
npx prisma migrate deploy

# Start the server
node server.js
