<h1 align="center">
  <br>
  <a href="https://n0rule.github.io/"><img src="wishlistbot.jpg" height="400" alt="wishlistbot.jpg"></a>
  <br>
  Wishlist Bot
  <br>
</h1>

A private Telegram bot for two or more people to share and manage their wishlists.
Each wish is automatically posted to a shared Telegram channel so people can see what the other wants as a gift.

## Features

- **Button-based UI** — fully navigable with inline buttons, no commands needed
- **Wizard wish creation** — guided 3-step flow with name, description, and optional photo
- **Paginated lists** — browse 5 wishes per page
- **My Wishes** — view and remove your own wishes in one place
- **All Wishes** — read-only view of everyone's wishes with author tags
- **Channel posting** — every wish is automatically posted and removed from the channel
- **Multi-language** — supports `en`, `uk`, `ru` via a single `.env` variable
- **Access control** — only allowed users (you two) can interact with the bot

## Project Structure

```
wishlist-bot/
├── data/
│   └── wishes.json          # local database (auto-created)
├── src/
│   ├── bot.js               # entry point
│   ├── handlers/
│   │   └── menu.js          # all inline button actions
│   ├── scenes/
│   │   └── newWish.scene.js # 3-step wish creation wizard
│   ├── commands/
│   │   ├── index.js         # registers all commands
│   │   ├── start.js
│   │   ├── newwish.js
│   │   ├── list.js
│   │   ├── listall.js
│   │   └── removewish.js
│   ├── services/
│   │   ├── db.js            # JSON file CRUD
│   │   └── channelPoster.js # posts/deletes channel messages
│   ├── locales/
│   │   ├── en.json
│   │   ├── uk.json
│   │   └── ru.json
│   └── utils/
│       ├── keyboard.js      # all Telegraf inline keyboards
│       ├── lang.js          # t() translation helper
│       ├── logger.js        # colored console logger
│       └── formatList.js    # wish list text formatter
├── .env
├── .gitignore
└── package.json
```

## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourname/wishlist-bot.git
cd wishlist-bot
npm install
```

### 2. Create a Telegram bot

1. Message [@BotFather](https://t.me/BotFather) → `/newbot`
2. Copy the token

### 3. Set up a Telegram channel

1. Create a channel in Telegram
2. Add your bot as an **Administrator**
3. Enable the **Post Messages** and **Delete Messages** permissions
4. Copy the channel ID (use `@username` or numeric `-100...` ID)

### 4. Get your user IDs

Message [@userinfobot](https://t.me/userinfobot) to find the numeric Telegram IDs for both users.

### 5. Configure `.env`

```env
BOT_TOKEN=your_bot_token_here
CHANNEL_ID=@yourchannel
ALLOWED_USERS=123456789,987654321
LOCALE=en
```

| Variable | Description |
|---|---|
| `BOT_TOKEN` | Token from BotFather |
| `CHANNEL_ID` | `@username` or `-100...` numeric ID |
| `ALLOWED_USERS` | Comma-separated Telegram user IDs |
| `LOCALE` | `en`, `uk`, or `ru` |

### 6. Run (optional local)

Use this command to run the bot directly with Node.js if you prefer a local setup.

```bash
npm start          # production
npm run dev        # development with auto-restart (nodemon)
```

### 7. Run using Docker Compose (recommended)

For a more reliable, portable deployment, Docker Compose is recommended but optional.

```bash
docker compose up --build
```

Then navigate to your container logs or use `docker compose logs -f` to verify bot startup.

## Usage

| Action | How |
|---|---|
| Open menu | `/start` or send any message |
| Add a wish | Tap **🎁 Add a Wish** → follow 3-step wizard |
| View your wishes | Tap **📋 My Wishes** |
| Remove a wish | Tap **📋 My Wishes** → tap the wish → confirm |
| View all wishes | Tap **🌍 All Wishes** |
| Remove by ID | `/removewish <id>` (power-user fallback) |

## Adding a New Language

1. Create `src/locales/xx.json` (copy `en.json` as a template)
2. Translate all values — keep all keys identical
3. Set `LOCALE=xx` in `.env`
4. Restart the bot

## Adding a New Command

1. Create `src/commands/mycommand.js`
2. Export `myCommand(bot)` with your handler
3. Import and call it in `src/commands/index.js`
4. If multi-step, create `src/scenes/myCommand.scene.js` and register it in `bot.js`

## Dependencies

| Package | Purpose |
|---|---|
| `telegraf` | Telegram bot framework |
| `dotenv` | Environment variable loading |

## License

MIT
