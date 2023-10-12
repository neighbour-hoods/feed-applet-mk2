# feed-applet-mk2
A Neighbourhoods applet for sharing and assessing posts (with the Like and Total Likes dimensions).

This repository is based on the new Holochain scaffolding, meaning new entry types can be added with ease. The generated code will need to be adapted to Neighbourhoods.

## Environment Setup

1. Install the holochain dev environment: https://developer.holochain.org/docs/install/
2. Clone this repo and `cd` inside of it.
3. Enter the nix shell by running this in the root folder of the repository: 

```bash
nix develop
pnpm install
```

## Packaging for the NH Launcher
After the above has been done, run:

```bash
pnpm run package
```
