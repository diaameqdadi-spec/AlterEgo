# Avatar Asset Pipeline

This folder is for internal asset development, not user-uploaded content.

## Purpose

Use this folder to manage robot/avatar still concepts before they are implemented in the UI.

## Structure

- `prompt-pack.md`: generation prompts and visual direction
- `manifest.json`: canonical avatar IDs, filenames, and statuses
- source images: raw generations or exports for review

## Recommended Workflow

1. Generate still images using the prompt pack.
2. Save raw candidates into this folder with descriptive filenames.
3. Select the best candidate for each avatar ID.
4. Export the final production asset into:
   - `frontend/public/assets/avatars/`
5. Update `manifest.json` when a final is chosen.

## Naming Convention

Use this pattern for source variants:

`<avatar-id>-v<version>-<color>.png`

Examples:

- `nova-v1-blue.png`
- `onyx-v2-silver.png`
- `pulse-v3-violet.png`

Use this pattern for final web assets:

`<avatar-id>.png`

Examples:

- `nova.png`
- `sage.png`
- `sentinel.png`

