# Closet

A digital wardrobe app for iPhone and Android, built with Expo (React Native).

## What it does

- **Add items**: photograph a clothing item; the phone cuts out the background (iOS 17+ Vision / Android ML Kit, on-device and free) so it looks like a product photo.
- **Closet**: grid of everything you own, with labels for type, colour, season, occasion, brand and favourites. Search and filter.
- **Outfits**: mix-and-match builder (with a 🎲 shuffle), saved outfits, favourites.
- **Style me**: a fruit-machine of outfit reels (top or dress, bottom, shoes, plus necklace, earrings and belt). Spin, lock the pieces you like, spin again and save. Filter by season and occasion; colour harmony and favourites guide the picks.
- **Week plan**: assign an outfit to each day, browse week by week.
- **Wishlist**: things you want to buy, with photo, price, link and notes. "Bought" takes you straight to adding it to your closet.

All data stays on the phone (AsyncStorage + images in the app's document folder).

## Run it

```bash
npm install
npx expo start          # scan the QR code with the Expo Go app
```

Background removal is a native module, so it works in a development or store build, not in Expo Go. In Expo Go the app keeps the original photo.

```bash
npx eas-cli@latest build --profile development --platform ios   # dev build with background removal
```

## Code layout

- `src/app/` screens (Expo Router). Tabs live in `src/app/(tabs)/`.
- `src/components/` shared UI (item thumbnails, outfit board, item form).
- `src/lib/` data store, image handling, outfit suggestion logic, types.

## Ideas for later

- 3D view of items
- Cloud backup and sync between devices
- Weather-aware suggestions
- Wear tracking ("last worn", cost per wear)
