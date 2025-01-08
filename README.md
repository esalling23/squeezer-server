# Squeezer Landing Page Generator API

This repository contains the site generator and API supporting the frontend of the [Squeezer Landing Page Generator Client](www.github.com/esalling23/squeezer-client).

## Using This Repo

1. `yarn install`
2. `yarn run start` to run server
3. `yarn run build` to build all css for sites

## Site Builder

The site builder works by passing user-defined site data into template files. Sites are regenerated upon data save, and statically served once published. 

Stack: 
- 11ty for site generation
- Handlebars for site templating
- ReactJS for site editing interface