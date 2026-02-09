# Quest

## Introduction / Summary

Quest is a dynamic hide and seek game where an admin can drop multiple quest items within a world for users to find.

## Built With

### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

## Key Features

- Search the world to find Quest items
- Collect up to a specified number per day
- Keep up your daily quest to stay on top of the leaderboard

### Canvas elements & interactions

- Key Asset: When clicked this asset will open the drawer and allow users and admins to start interacting with the app.
- Quest Items: When clicked the user will be credited with finding the Quest item and the item will then be hidden again somewhere else in the world

### Drawer content

- Leaderboard
- Admin settings
- Quest item found details

### Admin features

- Click on the key asset to open the drawer and select the Admin tab
- From here you can do the following:
  - Update Number Allowed To Collect Per Day. Changing this will change the number of Quest items a user can collect in a given day.
  - Update Quest Item Image URL. Change this will immediately change all Quest items already dropped in world. Note: This will not change the Key Asset image (see Implementation).
  - Click the Hide in world button to hide a new Quest item somewhere in the world. Once it's been placed you'll see it added to the bottom of the Placed items list
  - Click the Remove all button to remove all Quest items currently dropped in the world.
  - The Placed Items table shows a list of all existing Quest items. Clicking on the Walk to Item icon button will move your avatar to that place Quest item. Clicking on the Remove Item button will immediately remove the place Quest item from the world.

---

## Implementation Requirements

### Required Assets with Unique Names

| Unique Name Pattern | Description |
|---------------------|-------------|
| `questItem_{sceneDropId}` | Quest items dropped in the world. The app uses this pattern to track and manage quest items. |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `WEB_IMAGE_ASSET_ID` | The asset ID used to create web image assets for quest items. Default: `webImageAsset` |
| `DEFAULT_QUEST_ITEM_IMAGE_URL` | Default image URL for quest items when no custom image is set |

---

## Developers

### Getting Started

- Clone this repository
- Run `npm i` in server
- `cd client`
- Run `npm i` in client
- `cd ..` back to server

### Add your .env environmental variables

```json
API_KEY=xxxxxxxxxxxxx
DEFAULT_QUEST_ITEM_IMAGE_URL=pathtodefaultimage
INSTANCE_DOMAIN=api.topia.io
INSTANCE_PROTOCOL=https
INTERACTIVE_KEY=xxxxxxxxxxxxx
INTERACTIVE_SECRET=xxxxxxxxxxxxxx
WEB_IMAGE_ASSET_ID=webImageAsset
```

### Where to find API_KEY, INTERACTIVE_KEY and INTERACTIVE_SECRET

[Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)

[Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

### Data objects

_We use data objects to store information about each implementation of the app per world._

- Dropped Assets: the data object attached to the dropped assets can optionally include `questItemImage` which will be used instead of the default image when someone first interacts with the instance of Quest. Additionally it'll capture user progress to be displayed in the leaderboard

  - leaderboard (`leaderboard.${profileId}`)

- World: the data object attached to the world will store information for every instance of the app in a given world by sceneDropId and will persist if a specific instance is removed manually from world instead of through the Admin screen.

  - questItems (`scenes.${sceneDropId}.questItems.${assetId}`)

- User: the data object attached to the user will store user's progress per instance of Quest across all worlds.
  - currentStreak
  - lastCollectedDate
  - longestStreak
  - totalCollected
  - totalCollectedToday

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
<!-- - [View it in action!](topia.io/appname-prod) -->
- [Notion One Pager](https://www.notion.so/topiaio/Quest-b3501950507845f9bccfaa192285ab57?pvs=4)
