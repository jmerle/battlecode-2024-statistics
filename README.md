# Battlecode 2024 Statistics

[![Build Status](https://github.com/jmerle/battlecode-2024-statistics/workflows/Build/badge.svg)](https://github.com/jmerle/battlecode-2024-statistics/actions/workflows/build.yml)

This repository contains the source code behind [jmerle.github.io/battlecode-2024-statistics/](https://jmerle.github.io/battlecode-2024-statistics/), a website that displays Battlecode 2024 statistics.

The data the statistics are extracted from is scraped from the Battlecode 2024 API. The raw data that the website currently uses can be found in the [`data/teams.bin`](./data/teams.bin) and [`data/scrimmages.bin`](./data/scrimmages.bin) files. Both of these are JSON files compressed with zlib.
