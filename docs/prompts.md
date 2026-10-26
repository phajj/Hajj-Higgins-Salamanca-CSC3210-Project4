## LLM Prompts
This file records the prompts we gave to AI coding assistents and/or other LLMs for help while coding this project. It is orginaized by group member, each bullet depicts the initial prompt with the subbullets depicting the revision prompts.
## Peter (using Claude Code CLI)
- In loadTexture in @src/card.js load each texutre to each card. Use the lists of suits and vals to map each suburl of the baseUrl object, https://webisso.github.io/playing-cards/png/{card_name}.png . IE *<*img src="https://webisso.github.io/playing-cards/png/ace_of_spades.png" alt="Ace of Spades"> for vals = 1 and suits = "Spades"
    - **Note from Peter:** I edited this prompt to include *'s around the opening < for the source image so it doesn't display the actual image in this markdown.
- make a test envirment that lays out all 52 cards on a plain and lets the use click on cards to pick up and drag. double click to flip the card. Put this test geometry in @.gitignore
  - Added keyboard camera controls and zooming to the test so the card PNGs can be checked for resolution at different zooms and angles.
- Clean up @src/table.js . Currently I had a lot of articles left over from copy pasting from Three.js's docs, variables such as texture then in const material = new THREE.MeshBasicMaterial({map:texture}) are unnecessary to be formatted like that. Additionally clean up the loop to adjust where the legs get generated, they are supposed to hit all four corners of the topGeo
  - Added the table to the scene in main.js.
  - Adjusted the angle of the camera so all four legs and the tabletop are visable
## Jackson 
- Changed all of the table and card materials from MeshBasicMaterial to MeshPhongMaterial so they respond to lighting.

## Laura