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
