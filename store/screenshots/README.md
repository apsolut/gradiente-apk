# Screenshots

Play requires 2 to 8 phone screenshots; provide **at least 4** to stay eligible for
featuring. 9:16, PNG or JPG, 1080x1920 or larger.

These cannot be generated — Play rejects mock-ups, and the images must show the real
app running. Capture them from a release build on a device:

1. `eas build -p android --profile preview`, install the APK.
2. Set a bold gradient on the Create screen, screenshot it.
3. Presets tab with the category chips visible.
4. Export sheet with a size selected.
5. Code sheet showing the CSS output.

Optionally add 7-inch and 10-inch tablet screenshots — the app has to support large
screens anyway, since apps targeting API 36 cannot lock orientation or resizability.

Drop the files in this folder. They are gitignored by default; `git add -f` the ones
you actually ship.

## Current files are web-rendered stand-ins

`01-create`, `02-presets`, `03-export` and `04-code` were captured from the real app
running under react-native-web, via headless Chrome against `npx expo start --web`:

```bash
chrome --headless=new --hide-scrollbars --window-size=540,1000 \
  --force-device-scale-factor=2 --virtual-time-budget=20000 \
  --screenshot=out.png http://localhost:8081/<route>
```

A 540 CSS-px viewport keeps the phone layout (above 600dp the app switches to the
two-pane layout); the 2x scale factor yields 1080px-wide output. The two tab screens
are cropped to 1080x1904 to drop the tab bar, whose labels clip under
react-native-web — see [[06-knowledge/003-onlayout-does-not-fire-on-web]]. That
clipping does not happen on Android, where the bar gets its safe-area inset.

They are real app output, not mock-ups, and they satisfy every Play dimension rule.
They are still **not the Android rendering**: fonts, the slider and system UI differ.
Replace them with device captures from the preview APK before the production listing.
