# Shopping List Backend (Rust)

A high-performance shopping list backend written in Rust with Axum web framework and SQLite database.

## Features

- **Fast & Efficient**: Built with Rust for maximum performance
- **Local Database**: Uses SQLite for local data storage (no cloud dependency)
- **Tagging System**: Tag items with shops where they can be bought
- **Filtering**: Filter items by shop/tag
- **RESTful API**: Clean REST API for all operations
- **CORS Enabled**: Ready for frontend integration

## API Endpoints

### Items

- `GET /api/items` - Get all items (supports `?tag_id=X` query parameter for filtering)
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create a new item
  ```json
  {
    "content": "Milk",
    "checked": false,
    "tag_ids": [1, 2]
  }
  ```
- `PUT /api/items/:id` - Update an item
  ```json
  {
    "content": "Organic Milk",
    "checked": true,
    "tag_ids": [1]
  }
  ```
- `DELETE /api/items/:id` - Delete an item

### Tags (Shops)

- `GET /api/tags` - Get all tags
- `GET /api/tags/:id` - Get a specific tag
- `POST /api/tags` - Create a new tag
  ```json
  {
    "name": "Whole Foods",
    "color": "#00ff00"
  }
  ```
- `PUT /api/tags/:id` - Update a tag
  ```json
  {
    "name": "Whole Foods Market",
    "color": "#00aa00"
  }
  ```
- `DELETE /api/tags/:id` - Delete a tag

## Setup

### Development

1. Install Rust (https://rustup.rs/)
2. Copy `.env.example` to `.env`
3. Run the server:
   ```bash
   cargo run
   ```

### Production

Build and run with Docker:
```bash
docker build -t shopping-list-backend .
docker run -p 3001:3001 -v $(pwd)/data:/app/data shopping-list-backend
```

## Configuration

Environment variables:
- `DATABASE_URL`: SQLite database path (default: `sqlite:./shopping_list.db`)
- `PORT`: Server port (default: `3001`)

## Database Schema

The application uses three tables:

1. **items**: Shopping list items
2. **tags**: Tags/shops for categorization
3. **item_tags**: Many-to-many relationship between items and tags

## Migration from Node.js Backend

The new Rust backend maintains API compatibility with the original Node.js backend while adding new features:

1. Items now support multiple tags
2. New `/api/tags` endpoints for tag management
3. Filtering support via query parameters
4. Local SQLite database instead of MongoDB Atlas
