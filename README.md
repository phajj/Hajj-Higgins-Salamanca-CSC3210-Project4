# Hajj-Higgins-Salamanca-CSC3210-Project4

Computer Graphics Project 4, War Card Game

## Group Members:

- Peter Hajj (PM, Card & Table Designer)
- Jackson Higgins (Game Logic & Lighting)
- Laura Salamanca (Animation Designer)

## Overview

This project is a 3D simulation of the classic card game, War, developed using [Three.js](https://threejs.org/). The scene is lit from overhead and surrounded by a twilight skybox. The scene features ambient lighting and point lighting which can be toggled by the user.

## How to Play

- Press the `N` key to play out each round of the game
- Use the `W` `A` `S` `D` keys to move the point light
- Press the `L` key to toggle on and off the ambient light
- Press the `P` key to toggle on and off the point light
- Press the `M` key to toggle shadows on and off for the sun and point light
- The camera starts in a top-down view of the table
- Press the `C` key to cycle through the top-down, angled, and side camera views
- Press `1` for the top-down view, `2` for the angled view, and `3` for the side view (shows off the skybox)

## Running the Project

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start a local server:
   ```bash
   npm start
   ```
3. Open the printed local address (e.g. `http://localhost:3000`) in your browser.

## Technical Docs

- Lighting: One overhead point light, ambient lighting, and a twilight skybox containing a sun as a directional light
  that casts shadows alongside the point light.
- Camera: Three preset views (top-down, angled, and side) defined in `CAMERA_VIEWS` in `src/camera.js` and applied
  with `setCameraView`. `W` `A` `S` `D` light movement is relative to whichever view is active.

### Challenges

- N/A

### Resources

- Playing card textures: [webisso/playing-cards](https://github.com/webisso/playing-cards) on GitHub
- Rules for War: http://www.pagat.com/war/war.html
- Table texture: [Magnific](https://www.magnific.com/free-photo/natural-wooden-background_5505940.htm#fromView=keyword&page=1&position=6&uuid=5cf89975-08ea-41e9-9edf-86598d63d669&track=ais_hybrid&query=Wood+texture+png)

### LLM Prompts used

See [prompts.md](docs/prompts.md)
