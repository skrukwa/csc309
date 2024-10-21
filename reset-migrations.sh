#!/bin/bash

rm -fr prisma/migrations prisma/dev.db*

npx prisma migrate dev --name init
