use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Item {
    pub id: i64,
    pub content: String,
    pub checked: bool,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_deserializing)]
    #[sqlx(skip)]
    pub tags: Vec<Tag>,
}

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Tag {
    pub id: i64,
    pub name: String,
    pub color: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateItemRequest {
    pub content: String,
    #[serde(default)]
    pub checked: bool,
    #[serde(default)]
    pub tag_ids: Vec<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateItemRequest {
    pub content: Option<String>,
    pub checked: Option<bool>,
    pub tag_ids: Option<Vec<i64>>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub color: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTagRequest {
    pub name: Option<String>,
    pub color: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ErrorResponse {
    pub error: String,
}

impl ErrorResponse {
    pub fn new(error: impl Into<String>) -> Self {
        Self {
            error: error.into(),
        }
    }
}
