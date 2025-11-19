mod db;
mod handlers;
mod models;

use axum::{
    routing::{delete, get, post, put},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "shopping_list_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables from .env file
    dotenv::dotenv().ok();

    // Get configuration
    let database_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite:./shopping_list.db".to_string());
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "3001".to_string())
        .parse::<u16>()
        .expect("PORT must be a valid number");

    // Initialize database
    tracing::info!("Connecting to database: {}", database_url);
    let pool = db::init_db(&database_url).await?;
    tracing::info!("Database initialized successfully");

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build API routes
    let api_routes = Router::new()
        // Item routes
        .route("/items", get(handlers::get_items).post(handlers::create_item))
        .route(
            "/items/:id",
            get(handlers::get_item)
                .put(handlers::update_item)
                .delete(handlers::delete_item),
        )
        // Tag routes
        .route("/tags", get(handlers::get_tags).post(handlers::create_tag))
        .route(
            "/tags/:id",
            get(handlers::get_tag)
                .put(handlers::update_tag)
                .delete(handlers::delete_tag),
        )
        .with_state(pool);

    // Build main app with API routes and static file serving
    let app = Router::new()
        .nest("/api", api_routes)
        .fallback_service(ServeDir::new("dist"))
        .layer(cors);

    // Start server
    let addr = format!("0.0.0.0:{}", port);
    tracing::info!("Server running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
