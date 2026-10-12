/**
 * PRD F7 — every user-facing string lives here from day one.
 * `de.ts` is typed as Record<StringKey, string>, so a missing translation is a
 * compile error rather than an English string leaking into the German build.
 */
export const en = {
  "tab.create": "Create",
  "tab.presets": "Presets",
  "tab.favorites": "Favorites",
  "tab.settings": "Settings",

  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.done": "Done",
  "common.close": "Close",
  "common.undo": "Undo",
  "common.delete": "Delete",
  "common.rename": "Rename",
  "common.duplicate": "Duplicate",
  "common.retry": "Try again",

  "create.linear": "Linear",
  "create.radial": "Radial",
  "create.switchType": "Switch gradient type",
  "create.angle": "Angle",
  "create.randomize": "Randomize",
  "create.undo": "Undo",
  "create.redo": "Redo",
  "create.save": "Save",
  "create.export": "Export",
  "create.code": "Code",
  "create.addStop": "Add a colour stop",
  "create.removeStop": "Remove this colour stop",
  "create.editStop": "Edit this colour stop",
  "create.nothingToUndo": "Nothing to undo",
  "create.nothingToRedo": "Nothing to redo",

  "presets.header": "Tap a preset to open it in the editor",
  "presets.all": "All",
  "category.Sunset": "Sunset",
  "category.Ocean": "Ocean",
  "category.Pastel": "Pastel",
  "category.Neon": "Neon",
  "category.Dark": "Dark",
  "category.Mono": "Mono",
  "category.Nature": "Nature",

  "favorites.emptyTitle": "No favorites yet",
  "favorites.emptyBody":
    "Save a gradient from the Create screen and it will show up here.",
  "favorites.untitled": "Untitled",
  "favorites.saved": "Saved to favorites",
  "favorites.full": "Favorites are full (500 maximum)",
  "favorites.deleted": "Favorite deleted",
  "favorites.duplicated": "Favorite duplicated",
  "favorites.renamed": "Favorite renamed",
  "favorites.actions": "Favorite options",
  "favorites.openInEditor": "Open in the editor",

  "save.title": "Save gradient",
  "save.placeholder": "Name (optional)",
  "save.hint": "Saved on this device only.",

  "export.title": "Export",
  "export.size": "Size",
  "export.device": "This device",
  "export.deviceHint": "actual screen pixels",
  "export.share": "Share PNG",
  "export.working": "Preparing image...",
  "export.note":
    "Exported through the Android share sheet, so Gradiente never asks for photo or storage access.",
  "export.failed": "Could not export the image",
  "export.sharingUnavailable": "Sharing is not available on this device",

  "code.title": "Copy as code",
  "code.css": "CSS",
  "code.tailwind": "Tailwind",
  "code.hex": "Hex list",
  "code.json": "JSON",
  "code.copy": "Copy",
  "code.copied": "Copied to clipboard",

  "color.title": "Colour",
  "color.hex": "Hex",
  "color.invalidHex": "Enter a colour like #4F8CFF",
  "color.position": "Position",
  "color.apply": "Apply",
  "color.missingStop": "That colour stop no longer exists.",

  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.theme.system": "System",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.language": "Language",
  "settings.language.en": "English",
  "settings.language.de": "Deutsch",
  "settings.about": "About",
  "settings.privacy": "Privacy policy",
  "settings.licenses": "Open-source licenses",
  "settings.feedback": "Send feedback",
  "settings.rate": "Rate the app",
  "settings.version": "Version",
  "settings.build": "Build",
  "settings.note":
    "Gradiente collects no data. Everything you make stays on this device.",
  "settings.feedbackSubject": "Gradiente feedback",
  "settings.openFailed": "Could not open that link",

  "licenses.intro":
    "Gradiente is built on these open-source libraries. Every one is MIT or Apache 2.0 licensed.",
} as const;

export type StringKey = keyof typeof en;
