# TrendScout AI - Architecture Diagram

## System Architecture (Architecture Beta)

```mermaid
architecture-beta
    group frontend(cloud) [Frontend - React App]
        service ui(ui) [React UI] in frontend
        service api_client(api) [API Client] in frontend
        service state(state) [State Management] in frontend
        
        ui:L --- R:api_client
        api_client:B --- T:state

    group backend(cloud) [Backend - FastAPI]
        service api_server(server) [FastAPI Server] in backend
        service collector(service) [TikTok Collector] in backend
        service scorer(service) [Trend Scorer] in backend
        service scheduler(service) [Task Scheduler] in backend
        service db_orm(service) [SQLAlchemy ORM] in backend
        
        api_server:L --- R:collector
        api_server:B --- T:scorer
        api_server:R --- L:scheduler
        api_server:B --- T:db_orm

    group ml_service(cloud) [ML Service]
        service ml_api(server) [ML API Server] in ml_service
        service clip(service) [CLIP Service] in ml_service
        service ai_gen(service) [AI Generator] in ml_service
        
        ml_api:L --- R:clip
        ml_api:R --- L:ai_gen

    group database(cloud) [Database]
        service postgres(database) [PostgreSQL] in database
        service pgvector(service) [pgvector Extension] in database
        
        postgres:B --- T:pgvector

    group external(cloud) [External Services]
        service apify(api) [Apify API] in external
        service gemini(api) [Google Gemini] in external
        
    frontend:R --- L:backend
    backend:B --- T:ml_service
    backend:B --- T:database
    backend:R --- L:external
    ml_service:R --- L:external
```

## Detailed Component Architecture

```mermaid
architecture-beta
    group client(cloud) [Client Layer]
        service react_app(ui) [React + TypeScript] in client
        service vite(build) [Vite Build] in client
        service tailwind(ui) [Tailwind CSS] in client
        
        react_app:B --- T:vite
        react_app:R --- L:tailwind

    group api_layer(cloud) [API Layer]
        service fastapi(server) [FastAPI Server] in api_layer
        service cors(middleware) [CORS Middleware] in api_layer
        service auth(middleware) [Auth Middleware] in api_layer
        
        fastapi:B --- T:cors
        fastapi:R --- L:auth

    group business_logic(cloud) [Business Logic]
        service trends(service) [Trends Service] in business_logic
        service competitors(service) [Competitors Service] in business_logic
        service scripts(service) [AI Scripts Service] in business_logic
        service profiles(service) [Profiles Service] in business_logic
        
        trends:L --- R:competitors
        scripts:B --- T:profiles

    group data_layer(cloud) [Data Layer]
        service sqlalchemy(orm) [SQLAlchemy ORM] in data_layer
        service postgres(database) [PostgreSQL] in data_layer
        service models(service) [Data Models] in data_layer
        
        sqlalchemy:B --- T:postgres
        models:L --- R:sqlalchemy

    group ml_layer(cloud) [ML Layer]
        service clip_service(service) [CLIP Embeddings] in ml_layer
        service clustering(service) [K-Means Clustering] in ml_layer
        service gemini_api(api) [Gemini API] in ml_layer
        
        clip_service:R --- L:clustering
        clustering:B --- T:gemini_api

    group external_apis(cloud) [External APIs]
        service apify_scraper(api) [Apify TikTok Scraper] in external_apis
        service gemini_ai(api) [Google Gemini AI] in external_apis
        
    group background_jobs(cloud) [Background Jobs]
        service scheduler(service) [APScheduler] in background_jobs
        service rescan_task(service) [Rescan Task] in background_jobs
        
        scheduler:B --- T:rescan_task

    client:B --- T:api_layer
    api_layer:B --- T:business_logic
    business_logic:B --- T:data_layer
    business_logic:R --- L:ml_layer
    business_logic:R --- L:external_apis
    business_logic:B --- T:background_jobs
    ml_layer:R --- L:external_apis
```

## Microservices Architecture

```mermaid
architecture-beta
    group frontend_service(cloud) [Frontend Service]
        service react(ui) [React App] in frontend_service
        service build(build) [Vite Build] in frontend_service
        service deploy(deploy) [Cloudflare Pages] in frontend_service
        
        react:B --- T:build
        build:B --- T:deploy

    group backend_service(cloud) [Backend Service]
        service fastapi(server) [FastAPI] in backend_service
        service railway(deploy) [Railway.app] in backend_service
        service endpoints(api) [REST API] in backend_service
        
        fastapi:B --- T:railway
        endpoints:L --- R:fastapi

    group ml_service_arch(cloud) [ML Service]
        service ml_api(server) [ML API] in ml_service_arch
        service pytorch(service) [PyTorch] in ml_service_arch
        service railway_ml(deploy) [Railway.app] in ml_service_arch
        
        ml_api:B --- T:pytorch
        ml_api:B --- T:railway_ml

    group database_service(cloud) [Database Service]
        service postgres(database) [PostgreSQL] in database_service
        service supabase(deploy) [Supabase] in database_service
        service pgvector(extension) [pgvector] in database_service
        
        postgres:B --- T:supabase
        postgres:R --- L:pgvector

    frontend_service:R --- L:backend_service
    backend_service:B --- T:ml_service_arch
    backend_service:B --- T:database_service
    ml_service_arch:B --- T:database_service
```

## Data Flow Architecture

```mermaid
architecture-beta
    group user_interaction(cloud) [User Interaction]
        service browser(ui) [Web Browser] in user_interaction
        service ui_components(ui) [React Components] in user_interaction
        
        browser:B --- T:ui_components

    group api_gateway(cloud) [API Gateway]
        service fastapi_gateway(server) [FastAPI Router] in api_gateway
        service rate_limit(middleware) [Rate Limiting] in api_gateway
        
        fastapi_gateway:B --- T:rate_limit

    group processing(cloud) [Processing Layer]
        service collector(service) [Data Collector] in processing
        service scorer(service) [UTS Scorer] in processing
        service ml_processor(service) [ML Processor] in processing
        
        collector:R --- L:scorer
        scorer:B --- T:ml_processor

    group storage(cloud) [Storage Layer]
        service cache(disk) [Redis Cache] in storage
        service database(database) [PostgreSQL] in storage
        service vector_store(disk) [Vector Store] in storage
        
        database:R --- L:vector_store

    group external_services(cloud) [External Services]
        service apify(api) [Apify API] in external_services
        service gemini(api) [Gemini API] in external_services
        
    user_interaction:B --- T:api_gateway
    api_gateway:B --- T:processing
    processing:B --- T:storage
    processing:R --- L:external_services
```

## Deployment Architecture

```mermaid
architecture-beta
    group cdn(cloud) [CDN & Frontend]
        service cloudflare(cdn) [Cloudflare Pages] in cdn
        service static_assets(disk) [Static Assets] in cdn
        
        cloudflare:B --- T:static_assets

    group backend_deploy(cloud) [Backend Deployment]
        service railway_backend(deploy) [Railway Backend] in backend_deploy
        service fastapi_app(server) [FastAPI App] in backend_deploy
        service env_vars(config) [Environment Variables] in backend_deploy
        
        railway_backend:B --- T:fastapi_app
        fastapi_app:R --- L:env_vars

    group ml_deploy(cloud) [ML Deployment]
        service railway_ml(deploy) [Railway ML] in ml_deploy
        service ml_app(server) [ML Service App] in ml_deploy
        service model_cache(disk) [Model Cache] in ml_deploy
        
        railway_ml:B --- T:ml_app
        ml_app:B --- T:model_cache

    group database_deploy(cloud) [Database Deployment]
        service supabase_db(deploy) [Supabase] in database_deploy
        service postgres_db(database) [PostgreSQL] in database_deploy
        service backups(disk) [Backups] in database_deploy
        
        supabase_db:B --- T:postgres_db
        postgres_db:B --- T:backups

    cdn:R --- L:backend_deploy
    backend_deploy:B --- T:ml_deploy
    backend_deploy:B --- T:database_deploy
    ml_deploy:B --- T:database_deploy
```

## Technology Stack Overview

- **Frontend**: React 19 + TypeScript + Vite 7 + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + APScheduler
- **ML Service**: PyTorch + CLIP + Google Gemini Flash
- **Database**: PostgreSQL + pgvector
- **Deployment**: Cloudflare Pages (Frontend) + Railway.app (Backend/ML) + Supabase (Database)
- **External APIs**: Apify (TikTok Scraper) + Google Gemini (AI Generation)
