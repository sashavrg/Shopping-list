use crate::db;
use crate::models::{CreateItemRequest, CreateTagRequest, ErrorResponse, UpdateItemRequest, UpdateTagRequest};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use sqlx::SqlitePool;

#[derive(Deserialize)]
pub struct FilterParams {
    pub tag_id: Option<i64>,
}

// Item handlers
pub async fn get_items(
    State(pool): State<SqlitePool>,
    Query(params): Query<FilterParams>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    match db::get_all_items(&pool, params.tag_id).await {
        Ok(items) => Ok(Json(serde_json::json!(items))),
        Err(e) => {
            tracing::error!("Failed to get items: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to retrieve items")),
            ))
        }
    }
}

pub async fn get_item(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    match db::get_item_by_id(&pool, id).await {
        Ok(Some(item)) => Ok(Json(serde_json::json!(item))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Item not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to get item: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to retrieve item")),
            ))
        }
    }
}

pub async fn create_item(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateItemRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<ErrorResponse>)> {
    if payload.content.len() < 3 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::new("content must be at least 3 characters")),
        ));
    }

    match db::create_item(&pool, payload).await {
        Ok(item) => Ok((StatusCode::CREATED, Json(serde_json::json!(item)))),
        Err(e) => {
            tracing::error!("Failed to create item: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to create item")),
            ))
        }
    }
}

pub async fn update_item(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateItemRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    if let Some(ref content) = payload.content {
        if content.len() < 3 {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse::new("content must be at least 3 characters")),
            ));
        }
    }

    match db::update_item(&pool, id, payload).await {
        Ok(Some(item)) => Ok(Json(serde_json::json!(item))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Item not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to update item: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to update item")),
            ))
        }
    }
}

pub async fn delete_item(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    match db::delete_item(&pool, id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Item not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to delete item: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to delete item")),
            ))
        }
    }
}

// Tag handlers
pub async fn get_tags(
    State(pool): State<SqlitePool>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    match db::get_all_tags(&pool).await {
        Ok(tags) => Ok(Json(serde_json::json!(tags))),
        Err(e) => {
            tracing::error!("Failed to get tags: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to retrieve tags")),
            ))
        }
    }
}

pub async fn get_tag(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    match db::get_tag_by_id(&pool, id).await {
        Ok(Some(tag)) => Ok(Json(serde_json::json!(tag))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Tag not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to get tag: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to retrieve tag")),
            ))
        }
    }
}

pub async fn create_tag(
    State(pool): State<SqlitePool>,
    Json(payload): Json<CreateTagRequest>,
) -> Result<(StatusCode, Json<serde_json::Value>), (StatusCode, Json<ErrorResponse>)> {
    if payload.name.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(ErrorResponse::new("name is required")),
        ));
    }

    match db::create_tag(&pool, payload).await {
        Ok(tag) => Ok((StatusCode::CREATED, Json(serde_json::json!(tag)))),
        Err(e) => {
            tracing::error!("Failed to create tag: {}", e);
            let error_msg = if e.to_string().contains("UNIQUE constraint") {
                "Tag with this name already exists"
            } else {
                "Failed to create tag"
            };
            Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse::new(error_msg)),
            ))
        }
    }
}

pub async fn update_tag(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
    Json(payload): Json<UpdateTagRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<ErrorResponse>)> {
    if let Some(ref name) = payload.name {
        if name.is_empty() {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse::new("name cannot be empty")),
            ));
        }
    }

    match db::update_tag(&pool, id, payload).await {
        Ok(Some(tag)) => Ok(Json(serde_json::json!(tag))),
        Ok(None) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Tag not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to update tag: {}", e);
            let error_msg = if e.to_string().contains("UNIQUE constraint") {
                "Tag with this name already exists"
            } else {
                "Failed to update tag"
            };
            Err((
                StatusCode::BAD_REQUEST,
                Json(ErrorResponse::new(error_msg)),
            ))
        }
    }
}

pub async fn delete_tag(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    match db::delete_tag(&pool, id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err((
            StatusCode::NOT_FOUND,
            Json(ErrorResponse::new("Tag not found")),
        )),
        Err(e) => {
            tracing::error!("Failed to delete tag: {}", e);
            Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse::new("Failed to delete tag")),
            ))
        }
    }
}
