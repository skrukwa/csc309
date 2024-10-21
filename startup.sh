#!/bin/bash

# print a warning
warn() {
    printf "\e[33m[WARNING]\e[0m $1\n"
}

# get version of $1
get_version() {
    if command -v "$1" 1>/dev/null; then
        ver=$($1 --version 2>/dev/null | grep -o '[0-9]\+\.[0-9]\+\.[0-9]\+' | head -n 1)
        if [[ -n "$ver" ]]; then
            echo "$ver"
            return
        fi
    fi
    echo "0.0.0"
}

# check if version $1 >= $2
# echos a warning using $3 if the check fails
check_version_ge() {
    if [[ "$1" == "$2" ]]; then
        return 0
    elif printf '%s\n' "$1" "$2" | sort -C -V; then
        warn "$3 version must be at least $2. Found $1."
        return 1
    fi
    return 0
}

# check if ubuntu
if ! command -v lsb_release 1>/dev/null || ! [[ "$(lsb_release -is)" == "Ubuntu" ]]; then
    warn "Distribution must be Ubuntu."
elif ! [[ "$(lsb_release -is)" == "Ubuntu" ]]; then
    warn "Distribution must be Ubuntu. Found $(lsb_release -is)."
else
    check_version_ge "$(lsb_release -rs)" "22.04" "Ubuntu"
fi

# check versions
check_version_ge "$(get_version node)" "20.0.0" "Node.js"
check_version_ge "$(get_version gcc)" "11.0.0" "GCC"
check_version_ge "$(get_version g++)" "11.0.0" "G++"
check_version_ge "$(get_version python3)" "3.10.0" "Python"
check_version_ge "$(get_version java)" "20.0.0" "Java"

# install npm packages
printf "\nInstalling npm packages...\n"
npm clean-install

# run prisma migrations
printf "\nRunning Prisma migrations...\n"
npx prisma migrate dev
