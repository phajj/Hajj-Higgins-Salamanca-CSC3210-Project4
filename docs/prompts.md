## LLM Prompts

This file records the prompts we gave to AI coding assistents and/or other LLMs for help while coding this project. It is orginaized by group member, each bullet depicts the initial prompt with the subbullets depicting the revision prompts.

## Peter (using Claude Code CLI)

- In loadTexture in @src/card.js load each texutre to each card. Use the lists of suits and vals to map each suburl of the baseUrl object, https://webisso.github.io/playing-cards/png/{card_name}.png . IE *<*img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Ace of Spades"> for vals = 1 and suits = "Spades"
  - **Note from Peter:** I edited this prompt to include \*'s around the opening < for the source image so it doesn't display the actual image in this markdown.
- make a test envirment that lays out all 52 cards on a plain and lets the use click on cards to pick up and drag. double click to flip the card. Put this test geometry in @.gitignore
  - Added keyboard camera controls and zooming to the test so the card PNGs can be checked for resolution at different zooms and angles.
- Clean up @src/table.js . Currently I had a lot of articles left over from copy pasting from Three.js's docs, variables such as texture then in const material = new THREE.MeshBasicMaterial({map:texture}) are unnecessary to be formatted like that. Additionally clean up the loop to adjust where the legs get generated, they are supposed to hit all four corners of the topGeo
  - Added the table to the scene in main.js.
  - Adjusted the angle of the camera so all four legs and the tabletop are visable
- Set the camera in @src/camera.js to default as topdown view ie (0, 0, 0), then map the c key in @src/main.js to switch between the current camera angle and the top down angle. Additionally add a camera angle that has a centered view of the side of the table (to properly display the scenic skybox). In @src/main.js bind each angle to 1,2,3 keys (1 for main topdown, 2 for current and 3 for side angle). Finally update the controls and any other docs in @README.md
  - Fixed the M key handler so the sun's shadow toggle only runs on M instead of on every key press.
  - Wrapped each key letter in the README controls in backticks.

## Jackson

- Changed all of the table and card materials from MeshBasicMaterial to MeshPhongMaterial so they respond to lighting.
- Add a delay of two seconds from when the cards finish there draw animation to when they slide into the bottom of the deck
- Help me correct the logic for the war game
- Update face cards to use their artwork instead of symbol

## Laura

- What are some different algorithms to shuffle a deck of cards?
  - How to implement a Fisher-Yates shuffling algorithm?
-
