# AI Bot Workspace
An Electron application which includes testing workspaces for some AI competitions.

## Screenshots
### Light Riders competition window
![Competition window](https://i.imgur.com/N0ZnEml.png)

### Light Riders settings window
![Settings window](https://i.imgur.com/i7A71az.png)

## Getting up and running
### Prerequisites
- Node.js & npm
- Java 8

On Unix-like systems libgconf is required aswell. It and can be installed with `sudo apt-get install libgconf-2-4`.

### Installation
```bash
# Clone this repository
git clone https://github.com/jmerle/ai-bot-workspace.git

# Go into the created directory
cd ai-bot-workspace

# Install the necessary dependencies
npm install

# Run the application
npm start
```

On non-Windows systems it is required that the absolute path to the cloned directory does not contain spaces.

When opening a competition for the first time, some default settings will be loaded, including the commands for the bots. To change those, go to File -> Settings or press Command/Control + Comma.

## Included competitions
- Riddles.io
  - [Hack Man](https://booking.riddles.io/competitions/hack-man)
  - [Ms. Hack-Man](https://booking.riddles.io/competitions/ms.-hack-man)
  - [Light Riders](https://starapple.riddles.io/competitions/light-riders)
  - [AI Block Battle](https://playground.riddles.io/competitions/ai-block-battle) (also available on [The AI Games](http://theaigames.com/competitions/ai-block-battle))
  - [Ultimate Tic Tac Toe](https://playground.riddles.io/competitions/ultimate-tic-tac-toe) (also available on [The AI Games](http://theaigames.com/competitions/ultimate-tic-tac-toe))

## Credits
This application would not be possible without the game engines, match wrapper and match viewers. All of these were made by the awesome people over at [Riddles.io](https://github.com/riddlesio) & [The AI Games](https://github.com/theaigames).
