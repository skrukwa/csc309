#!/bin/bash

rm -fr prisma/migrations prisma/dev.db*

prisma migrate dev --name init
