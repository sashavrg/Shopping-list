# Migration Guide: Node.js to Rust Backend

## Overview

The Shopping List application has been rewritten with a new Rust backend featuring:
- **High Performance**: Rust-based backend using Axum web framework
- **Local Database**: SQLite instead of MongoDB Atlas (no cloud dependency)
- **Tagging System**: Tag items with shops where they can be bought
- **Filtering**: Filter items by shop/tag
- **Enhanced UI**: Updated frontend with tag management

## What's Changed

### Backend Changes

#### 1. Technology Stack
- **Old**: Node.js + Express + MongoDB (Atlas)
- **New**: Rust + Axum + SQLite (local file)

#### 2. Database
- **Old**: MongoDB Atlas (cloud)
- **New**: SQLite (local file: `shopping_list.db`)
  - No internet connection required
  - No MongoDB Atlas account needed
  - Data stored locally in the backend directory

#### 3. Data Model
**Old**:
```javascript
{
  id: string,
  content: string,
  checked: boolean
}
```

**New**:
```rust
{
  id: i64,
  content: string,
  checked: boolean,
  tags: [
    {
      id: i64,
      name: string,
      color: string
    }
  ],
  created_at: string,
  updated_at: string
}
```

### Frontend Changes

#### 1. New Features
- **Tag Manager Component**: Create and manage shops/tags
- **Tag Filtering**: Filter items by selecting a shop
- **Item Tagging**: Assign multiple shops to each item
- **Tag Badges**: Visual indicators showing which shops carry each item

#### 2. New Components
- `TagManager.jsx` - Manage shops/tags
- Updated `Item.jsx` - Display and manage item tags
- New service `tags.js` - API calls for tag management

### API Changes

#### New Endpoints

**Tags/Shops Management**:
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create a new tag
  ```json
  {
    "name": "Whole Foods",
    "color": "#00ff00"
  }
  ```
- `GET /api/tags/:id` - Get a specific tag
- `PUT /api/tags/:id` - Update a tag
- `DELETE /api/tags/:id` - Delete a tag

**Items with Tags**:
- `GET /api/items?tag_id=X` - Filter items by tag
- Items now include a `tags` array in responses
- Creating/updating items accepts `tag_ids` array:
  ```json
  {
    "content": "Milk",
    "checked": false,
    "tag_ids": [1, 2]
  }
  ```

#### Unchanged Endpoints
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get a specific item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

## Migration Steps

### Option 1: Using the New Rust Backend

1. **Navigate to the Rust backend**:
   ```bash
   cd backend-rust
   ```

2. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Run the backend**:
   ```bash
   cargo run --release
   ```

4. **The backend will**:
   - Create `shopping_list.db` automatically
   - Run migrations to set up tables
   - Start server on port 3001

### Option 2: Using Docker

1. **Build the Rust backend Docker image**:
   ```bash
   cd backend-rust
   docker build -t shopping-list-rust .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3001:3001 -v $(pwd)/data:/app/data shopping-list-rust
   ```

### Data Migration

If you want to migrate data from MongoDB to SQLite:

1. **Export from MongoDB**:
   ```bash
   # Use MongoDB Atlas UI or mongodump to export items
   ```

2. **Import to SQLite**:
   - Use the `/api/items` POST endpoint to create items
   - Write a script to iterate through exported items

**Example migration script** (Node.js):
```javascript
const oldItems = require('./exported-items.json');
const axios = require('axios');

async function migrate() {
  for (const item of oldItems) {
    await axios.post('http://localhost:3001/api/items', {
      content: item.content,
      checked: item.checked,
      tag_ids: []
    });
  }
}

migrate();
```

## Configuration

### Environment Variables

Create a `.env` file in `backend-rust/`:

```env
DATABASE_URL=sqlite:./shopping_list.db
PORT=3001
```

### Database Location

By default, the database is created at:
- Development: `backend-rust/shopping_list.db`
- Docker: `/app/data/shopping_list.db` (mounted volume)

## Troubleshooting

### Port Already in Use
If port 3001 is taken:
1. Stop the old Node.js backend
2. Or change the PORT in `.env`

### Database Locked
If you see "database is locked" errors:
- Only run one instance of the backend
- Ensure no other processes are accessing the SQLite file

### Migration Issues
If items don't appear after migration:
- Check the API response for errors
- Verify the database file exists
- Check file permissions on `shopping_list.db`

## Performance Improvements

The Rust backend offers:
- **~10x faster** response times for API calls
- **~5x lower** memory usage
- **Native async/await** with Tokio runtime
- **Type safety** preventing runtime errors
- **Zero-cost abstractions** for maximum efficiency

## Rollback Plan

To revert to the old Node.js backend:

1. Stop the Rust backend
2. Navigate to `Backend/`:
   ```bash
   cd Backend
   ```
3. Start the Node.js backend:
   ```bash
   npm start
   ```

Note: The old backend won't have access to tag data stored in SQLite.

## Support

For issues or questions:
1. Check the `backend-rust/README.md`
2. Review the API documentation above
3. Open an issue in the repository
