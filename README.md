# Quest

## Introduction / Summary

Quest is a dynamic hide and seek game where an admin can drop multiple quest items within a world for users to find.

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

## Developers:

### Getting Started

- Clone this repository
- Run `npm i` in server
- `cd client`
- Run `npm i` in client
- `cd ..` back to server

### Add your .env environmental variables

```json
API_KEY=xxxxxxxxxxxxx
DEFAULT_KEY_ASSET_IMAGE_URL=pathtodefaultimage
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

- Key Asset: the data object attached to the dropped key asset will store game settings related to this specific implementation of the app and would be deleted if the key asset is removed from world.
  - Number Allowed To Collect (default 5)
  - Quest Item Image,
- World: the data object attached to the world will store analytics information for every instance of the app in a given world by keyAssetId and will persist even if a specific instance is removed from world.

  - itemsCollectedByUser (`keyAssets.${keyAssetId}.itemsCollectedByUser.${profileId}.count`)
  - totalItemsCollected (`keyAssets.${keyAssetId}.totalItemsCollected.count`)
  - questItems (`keyAssets.${keyAssetId}.questItems.${assetId}.count`)

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
<!-- - [View it in action!](topia.io/appname-prod) -->
- [Notion One Pager](https://www.notion.so/topiaio/Quest-b3501950507845f9bccfaa192285ab57?pvs=4)
