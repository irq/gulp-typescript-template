# Gulp Typescript project template
A template for creating typescript projects using a gulp workflow. Compiles css from sass (.scss). 

## Getting started
To get started create a project folder and place the files from this repo in it. Run `npm install` and the following comments become availible.
* gulp - build the project for development
* gulp serve - build, watch and run development version on a local server
* gulp production - build the project for production (minification, bundling and source maps)

Source files should be places under the "app" folder and will be build into the "build" folder.

## Customize
* To update source and output file locations and names updates properties in gulpfile.config.json.
* All typescript will be linted using the settings in tslint.json.
