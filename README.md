# Orchid command-line

This folder contains a command-line version of the Orchid application.

## Building
You need orchid-core and orchid-service-vpn which you can get from here:

    cd ..
    git clone https://git.orchidprotocol.org/orchid/orchid-core.git
    git clone https://git.orchidprotocol.org/orchid/orchid-service-vpn.git

You need to build and "link" both `core` and `service-vpn`:

    cd orchid-core
    ./setup
    ./install
    npm run build
    npm link
    cd ..

    cd orchid-service-vpn
    ./setup
    ./install
    npm link @orchidprotocol/core
    npm run build
    npm link
    cd ..

Once that's done, you can build in this directory:

    cd orchid-command-line
    npm link @orchidprotocol/core
    npm link @orchidprotocol/service-vpn
    npm install

## Usage

`npm start` will start the proxy and launch Chrome.

## TODO

- This code is mostly copy-and-pasted from the /index.js file in orchid-desktop. Things should be refactored to get rid of this code duplication.
- The user data directory is hard-coded.
