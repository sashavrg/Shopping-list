use crate::models::{CreateItemRequest, CreateTagRequest, Item, Tag, UpdateItemRequest, UpdateTagRequest};
use anyhow::Result;
use sqlx::sqlite::SqlitePool;

pub async fn init_db(database_url: &str) -> Result<SqlitePool> {
    let pool = SqlitePool::connect(database_url).await?;

    // Run migrations
    sqlx::query(include_str!("../migrations/001_init.sql"))
        .execute(&pool)
        .await?;

    Ok(pool)
}

// Item operations
pub async fn get_all_items(pool: &SqlitePool, tag_id: Option<i64>) -> Result<Vec<Item>> {
    let mut items = if let Some(tag_id) = tag_id {
        // Filter by tag
        sqlx::query_as::<_, Item>(
            "SELECT DISTINCT i.* FROM items i
             INNER JOIN item_tags it ON i.id = it.item_id
             WHERE it.tag_id = ?
             ORDER BY i.created_at DESC"
        )
        .bind(tag_id)
        .fetch_all(pool)
        .await?
    } else {
        // Get all items
        sqlx::query_as::<_, Item>(
            "SELECT * FROM items ORDER BY created_at DESC"
        )
        .fetch_all(pool)
        .await?
    };

    // Load tags for each item
    for item in &mut items {
        item.tags = get_item_tags(pool, item.id).await?;
    }

    Ok(items)
}

pub async fn get_item_by_id(pool: &SqlitePool, id: i64) -> Result<Option<Item>> {
    let mut item = sqlx::query_as::<_, Item>(
        "SELECT * FROM items WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    if let Some(ref mut item) = item {
        item.tags = get_item_tags(pool, item.id).await?;
    }

    Ok(item)
}

pub async fn create_item(pool: &SqlitePool, req: CreateItemRequest) -> Result<Item> {
    let result = sqlx::query(
        "INSERT INTO items (content, checked) VALUES (?, ?)"
    )
    .bind(&req.content)
    .bind(req.checked)
    .execute(pool)
    .await?;

    let item_id = result.last_insert_rowid();

    // Add tags
    for tag_id in req.tag_ids {
        add_tag_to_item(pool, item_id, tag_id).await?;
    }

    get_item_by_id(pool, item_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to retrieve created item"))
}

pub async fn update_item(pool: &SqlitePool, id: i64, req: UpdateItemRequest) -> Result<Option<Item>> {
    // Check if item exists
    let exists = sqlx::query("SELECT id FROM items WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .is_some();

    if !exists {
        return Ok(None);
    }

    // Update fields that are provided
    if let Some(content) = &req.content {
        sqlx::query("UPDATE items SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .bind(content)
            .bind(id)
            .execute(pool)
            .await?;
    }

    if let Some(checked) = req.checked {
        sqlx::query("UPDATE items SET checked = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .bind(checked)
            .bind(id)
            .execute(pool)
            .await?;
    }

    // Update tags if provided
    if let Some(tag_ids) = req.tag_ids {
        // Remove all existing tags
        sqlx::query("DELETE FROM item_tags WHERE item_id = ?")
            .bind(id)
            .execute(pool)
            .await?;

        // Add new tags
        for tag_id in tag_ids {
            add_tag_to_item(pool, id, tag_id).await?;
        }
    }

    get_item_by_id(pool, id).await
}

pub async fn delete_item(pool: &SqlitePool, id: i64) -> Result<bool> {
    let result = sqlx::query("DELETE FROM items WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

// Tag operations
pub async fn get_all_tags(pool: &SqlitePool) -> Result<Vec<Tag>> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags ORDER BY name ASC"
    )
    .fetch_all(pool)
    .await?;

    Ok(tags)
}

pub async fn get_tag_by_id(pool: &SqlitePool, id: i64) -> Result<Option<Tag>> {
    let tag = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags WHERE id = ?"
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    Ok(tag)
}

pub async fn create_tag(pool: &SqlitePool, req: CreateTagRequest) -> Result<Tag> {
    let result = sqlx::query(
        "INSERT INTO tags (name, color) VALUES (?, ?)"
    )
    .bind(&req.name)
    .bind(&req.color)
    .execute(pool)
    .await?;

    let tag_id = result.last_insert_rowid();

    get_tag_by_id(pool, tag_id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Failed to retrieve created tag"))
}

pub async fn update_tag(pool: &SqlitePool, id: i64, req: UpdateTagRequest) -> Result<Option<Tag>> {
    // Check if tag exists
    let exists = sqlx::query("SELECT id FROM tags WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?
        .is_some();

    if !exists {
        return Ok(None);
    }

    // Update fields that are provided
    if let Some(name) = &req.name {
        sqlx::query("UPDATE tags SET name = ? WHERE id = ?")
            .bind(name)
            .bind(id)
            .execute(pool)
            .await?;
    }

    if let Some(color) = &req.color {
        sqlx::query("UPDATE tags SET color = ? WHERE id = ?")
            .bind(color)
            .bind(id)
            .execute(pool)
            .await?;
    }

    get_tag_by_id(pool, id).await
}

pub async fn delete_tag(pool: &SqlitePool, id: i64) -> Result<bool> {
    let result = sqlx::query("DELETE FROM tags WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

// Helper functions
async fn get_item_tags(pool: &SqlitePool, item_id: i64) -> Result<Vec<Tag>> {
    let tags = sqlx::query_as::<_, Tag>(
        "SELECT t.* FROM tags t
         INNER JOIN item_tags it ON t.id = it.tag_id
         WHERE it.item_id = ?
         ORDER BY t.name ASC"
    )
    .bind(item_id)
    .fetch_all(pool)
    .await?;

    Ok(tags)
}

async fn add_tag_to_item(pool: &SqlitePool, item_id: i64, tag_id: i64) -> Result<()> {
    sqlx::query(
        "INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)"
    )
    .bind(item_id)
    .bind(tag_id)
    .execute(pool)
    .await?;

    Ok(())
}
