# Contributing
A bit of information regarding adding new competitions and pull requests.

## Setting up
0. Make sure you got Java, [Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed ([npm](https://www.npmjs.com/) in the place of Yarn should work too).
1. Clone this repository and `cd` into it.
2. Checkout the `development` branch (and make sure to create feature branches off the `development` branch).
3. Run `yarn`.
4. Run `yarn start` to start the application.

## Adding new competitions
Adding new Riddles.io competitions is relatively easy (compared to 1.x it's a breeze). Here are the steps:

0. Open `src/competitions/ms-hack-man/MsHackMan.js` and use it as an example.
1. Copy `src/competitions/ms-hack-man` to `src/competitions/<new-competition-id>`.
2. Rename the `MsHackMan.js` in the newly added directory to the name of the new competition.
3. Rename the class name in the just renamed file (and also rename it in the `module.exports` part).
4. Change the id, name, description and url to the competition's data.
5. Fill the wrapper part in `default-wrapper-commands.json` with the default wrapper configuration.
6. Copy the competition's engine to `engine/` and rename it to `engine-*.*.*.jar` (replace the stars with the version number, obviously). Also change the version part in the `this.paths.engine` variable in the javascript file.
7. Change `super(true)` to `super(false)` if the competition does not have a seed (check this by searching the engine source code for "RANDOM SEED IS: ", which in the Ms. Hack Man engine can be found [here](https://github.com/riddlesio/hack-man-2-engine/blob/development/src/java/io/riddles/hackman2/engine/HackMan2Engine.java#L236)).
8. Keep `this.matchViewerPercentage = 84.286;` at 84.286 if the size of the match viewer has the same size as the Ms. Hack-Man and Hack Man competitions, change it to 58.8 if it does not.
9. Remove `this.configurationItems.push(...)` if there are no configuration items, or modify it based on what the engine supports (the seed is automatically added as a configuration item by `super(true)`). To find the configurable items, look for a `getDefaultConfiguration()` method in the engine source, which in the Ms. Hack-Man competition is located [here](https://github.com/riddlesio/hack-man-2-engine/blob/development/src/java/io/riddles/hackman2/engine/HackMan2Engine.java#L63). Take a look at the ConfigurationItem class in `src/competitions/ConfigurationItem.js` to see which parameter does what.
10. For the match viewer, things get a bit more complicated to make sure it's completely available offline.
    0. Clear the `fonts/` and the `img/` directories.
    1. Go to the match logs of the competition, open a match, right-click on the match viewer and select "View frame source".
    2. This image should explain which source code goes where:
    ![Source locations](https://i.imgur.com/nMPG3jP.png)
    3. Replace the existing `css/main.min.css`, `css/override.min.css` and `js/main.min.js` with the source as seen in the picture above (but keep the header comment linking to Riddles.io).
    4. In the css files, search for .woff and .woff2. Download the fonts these link to, place them in the `fonts/` directory and link them in the css files (`url('../fonts/font-name.woff2')` for example).
    5. Download all image files linked in the css files (search for .svg, .png, .jpg and .jpeg), and put them in the `img/` directory.
    6. In the js file, search for image files aswell. Convert all the image links to base64 links (using a tool like [this](https://www.base64-image.de/) base64 encoder).
11. Add the competition to `src/competitions/competitions.js`.

## Pull requests
Just one thing about pull requests: send them to the `development` branch.
