# Night Shift

Double-click `launch.bat`, then open http://127.0.0.1:8765. Keep its terminal running. Opening `index.html` directly also works, using the same evidence rules without Laya.

## Mission and tactics

The first assignment in a browser is followed by a paused training walkthrough. It shows each control as a looping animation (keys light up when you press them), then teaches E hands-on: you walk around the starting room, with security still paused, and press E at the spotlit floor directory. It then spotlights the service lift, gives one card per mission objective (where it is, what to do there, its time limit and what it unlocks or requires), and finishes with a card on threats. After training, a banner guides your first E press. Click **? Tutorial** in the header to replay it; Esc skips it. Set `Tutorial.objectiveLayout` in `tutorial.js` to `'list'` to show every objective on one card instead.

Usable things are marked in play: amber diamonds over unfinished objectives, cyan diamonds over optional equipment. Whatever E would act on gets a ring and an [E] keycap, and a prompt at the bottom of the screen names it. When two things are in reach, E uses the closest one that is still usable.

Each assignment opens with a fading briefing. Click **Hear briefing** for browser text-to-speech, then **Begin mission** (or Enter) to deploy. Security stays paused while you read. Speech works without the Laya model; available voices depend on your browser/system. Sound off also mutes speech.

Seeds choose between recovering archive files (card, power, archive), sabotaging security (power and restricted lab relay), and gathering intelligence (two patrol cabinets). Complete your assigned checklist, then return to the lift. R points toward your next unfinished objective.

Steal the cyan access card, hack the green power console to override the firewall, download the archive, then return to the service lift. Power control also creates a 25-second camera/laser blackout. After downloading, patrols move faster. Security keeps moving during puzzles; disconnect or press Escape to abort.

Every room has an interactive station. Offices and server rooms disable nearby cameras, records rooms reveal guard positions, lounges replenish decoys, workshops upgrade your tools, the lobby directory reveals the layout, and the restricted lab contains a laser relay. Press E near a station. Rewards are single-use except the main power console.

Rotate circuit tiles to connect live current, drag matching cables into sockets, or press Space/click the breaker while its moving load meter is green three times. Filing cabinets have drawers you drag open to retrieve a folder. Circuit puzzles allow 40 seconds, breakers 26 seconds, and other puzzles 30 seconds; upgraded tools add 10 seconds. Three mistakes end a cable or breaker attempt and attract security.

| Input | Action |
| --- | --- |
| WASD / arrows | Move |
| Shift | Sneak: slower movement and detection |
| Space | Short dash, 3.2-second cooldown; makes noise |
| Q | Throw one of three decoys ahead; nearby guards investigate |
| R | Scan the direction of your next objective for 3 seconds |
| E | Collect/read items, hack consoles, or short a nearby camera |

Desks and server racks block movement and vision. Guards outside a room cannot see you inside it, even through the doorway. A guard that spots you in the hallway gives chase, though: it tracks you into the room you duck into and sees you once it is inside. A decoy or a passed questioning check breaks the chase. Use cover, bait patrols into corridors, time camera sweeps, and cross laser gates while green. A laser trip records an alarm and calls guards; two trips end the run. Cameras at full suspicion raise red alert. Shorting a camera disables it for 12 seconds but creates noise.

The optional contractor work order contains a seed-specific ticket number, supervisor and task. In ordinary rooms, guards accept detailed, consistent explanations: an assigned repair, badge-supported task, or honest wrong-floor story. You do not need to quote both the ticket and supervisor. Follow-ups retain your first answer's context. Vague excuses, contradictions and admitted crimes fail. Successful explanations clear suspicion, clear stale tampering evidence, and give 12 seconds to move on; repeat stops do not automatically fail. Cameras also permit explanations for ordinary sightings. Being caught in the restricted archive or lab, or after stealing files, causes immediate loss.

## Generation and presentation

Each seed packs 12 differently sized rooms onto both sides of a continuous serpentine hallway. Rooms sit close to the corridor with single entrances; randomized dimensions and offsets break up the rows. Main corridors are 5 or 7 tiles wide, with bends and an optional connecting loop. Equipment islands block corridor camera sight and leave routes around both sides. Wooden crates line the hallways every few tiles, set one row in from a wall so you can duck into the pocket behind them; each is kept only if the hallway stays connected, and none sit in front of a doorway or beside a corridor camera. The hallway stays connected without entering rooms, even with cover in place. Restricted rooms have striped warning doors: approach and press E to open/close them. The archive requires the cyan card. Closed doors block movement, vision and guard paths. Work order, card and power control are placed before the archive gate. Cover preserves doorway approaches and objective routes.

Use the floor directory to reveal the layout. While outside a room, custom drawn electrical, camera, file, toolkit, supply, keycard and lift symbols identify rooms on the floor and minimap. These are canvas artwork, not emoji; directory knowledge resets with each floor. The directory does not reveal hidden guards.

The play screen uses the full window with no sidebar, control legend, telemetry or log. Mission instructions appear in the opening briefing; machine instructions explain their controls and effects beneath their names in interaction panels. Instant pickups show a confirmation panel; Continue or Escape returns to play. The toolkit adds 10 seconds to hacking, reduces dash cooldown from 3.2 to 2 seconds, and adds one decoy.

Fog reveals the complete current room plus up to 18 tiles through open doorways. Corridor vision extends 16 tiles and stops at walls and closed doors. The view is zoomed out to show more surroundings. Explored areas stay dimly visible; unseen enemies remain hidden. Original PNG textures include carpet, wood, brushed metal, rubber, circuit boards, cabinets, supplies, tools, relays and terminals, alongside canvas walls and characters. All art works offline. `generate_textures.py` regenerates the PNG assets using Pillow; Pillow is not required to play.

Synthesized sounds cover footsteps, pickups, dashes, decoys, hacking, warnings, questioning, passes, laser trips, alarms and extraction. Audio starts after a click or keypress, as required by browsers. The header has a Sound on/off button. No external sound files or network are needed.

## Local model

Laya 0.3.24 and the English weights are installed in this project's `.venv` and `models/`. CPU inference is tested against the guard-story suite; corroborated stories cannot be vetoed solely by an uncertain model. Serious physical evidence still fails. The package emits a checkpoint-calibration warning; this game uses selected choices rather than confidence thresholds. Source: https://github.com/NandhaKishorM/laya

On another machine: create a Python 3.10+ virtual environment, install `requirements.txt`, and run `download_model.py` with that interpreter. The first download needs network access; subsequent game inference uses cached weights. No API key is needed.

## Validation

- `node test_world.js`: 1,000 deterministic floors; card/power before gate, archive after gate, reachable extraction.
- `node test_puzzles.js`: 500 seeds across four puzzle types, including solvability, mistakes and timing windows.
- `node test_sprites.js`: upright directional character poses, walking frames and stable idle frames. `sprites-preview.png` shows the agent and robot animation frames.
- `.venv\Scripts\python.exe test_briefing_browser.py`: fade animation, voice text, mute/cancellation and briefing controls in Edge; speech calls are mocked for reliable automation.
- `.venv\Scripts\python.exe test_layout_browser.py`: real Edge rendering of directory icons, compact corridors and security cover; writes `directory-preview.png` and `layout-preview.png`.
- `node test_game.js`: gameplay loop, first-run training and interactable markers, 20 patrol simulations, full-room fog/doorway peeking, tactics, live hack timeout and security rules.
- `node test_security.js` and `python -m unittest test_guard_cases.py`: 23 shared guard scenarios, including natural passes, follow-ups, contradictions, technical language and restricted-room failures.
- `.venv\Scripts\python.exe test_guard_cases.py --live`: the same scenarios against loaded local Laya plus game evidence rules; fails if the model cannot load.
- `python -m unittest test_server.py`: decision rules and HTTP routes.
- `.venv\Scripts\python.exe browser_smoke.py`: real Edge browser tests for firewall prerequisite, extraction, strict questioning, identity, tools and moving patrols during hacking. Requires `requirements-dev.txt`.

`preview.png` shows the current game. This remains a one-floor prototype; vents, weapons, vaults and floor progression are not implemented.
