
export const OPENAPI_SPEC = {
  "openapi": "3.0.0",
  "info": {
    "title": "ParSam Studio Core API",
    "version": "11.0.0",
    "description": "Unified API for ParSam Ecosystem (Web/Mobile/Desktop). Features CRDT-based sync, E2EE, and AI services."
  },
  "servers": [
    { "url": "https://api.parsamstudio.com/v1", "description": "Production (K8s Cluster US-East)" },
    { "url": "https://staging.parsamstudio.com/v1", "description": "Staging (Auto-Deploy)" }
  ],
  "components": {
    "securitySchemes": {
      "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
    }
  },
  "paths": {
    "/auth/register": {
      "post": {
        "summary": "Register new user",
        "requestBody": {
          "content": { "application/json": { "schema": { "type": "object", "properties": { "email": {"type": "string"}, "password": {"type": "string", "format": "argon2id-hash"}, "lang": {"type": "string"} } } } }
        },
        "responses": { "201": { "description": "User created, verification email sent" } }
      }
    },
    "/sync/push": {
      "post": {
        "summary": "Push local CRDT updates",
        "description": "Syncs local Yjs/CRDT state vector with cloud. Handles conflict resolution automatically.",
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "content": { "application/octet-stream": { "schema": { "type": "string", "format": "binary" } } }
        },
        "responses": { "200": { "description": "Merged successfully, returns diff" } }
      }
    },
    "/notes/{id}/embed": {
      "post": {
        "summary": "Generate Vector Embeddings",
        "description": "Triggers background AI worker to generate semantic embeddings for search.",
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }],
        "responses": { "202": { "description": "Processing started" } }
      }
    }
  }
};

export const ARCHITECTURE_DOCS = [
  {
    title: "1. Core Services Layer",
    description: "Microservices architecture deployed on Kubernetes.",
    items: [
      "Auth Service (Go): Handles Identity, JWT, 2FA, Argon2id hashing.",
      "Sync Engine (Node.js/Rust): CRDT merge logic, WebSocket gateway for real-time collab.",
      "AI Worker (Python): Wraps Gemini API for OCR, embedding, and generation tasks.",
      "File Service (Node.js): S3-compatible object storage interface with chunked encryption."
    ]
  },
  {
    title: "2. Data Layer",
    description: "Polyglot persistence strategy.",
    items: [
      "PostgreSQL 15: Relational data (Users, Billing, Metadata).",
      "Redis Cluster: Hot cache, Pub/Sub for sync events.",
      "Vector DB (Milvus/Pinecone): Semantic search index for Notes/Files.",
      "Object Storage (MinIO/S3): Encrypted file blobs."
    ]
  },
  {
    title: "3. Client Layer (Multi-Platform)",
    description: "Unified codebase using React (Web) and adapters for Native.",
    items: [
      "Web: React 19 SPA, PWA capabilities.",
      "Desktop: Tauri wrapper around Web App, local Rust backend for offline-first.",
      "Mobile: Flutter app sharing logic via FFI or WebView bridge for core sync.",
      "Shared SDK: TypeScript library 'parsam-core' for logic reuse."
    ]
  }
];

export const PIPELINE_STEPS = [
  { id: 1, name: "Code Analysis", status: "success", detail: "Linting, Static Analysis, Secret Scanning" },
  { id: 2, name: "Unit Tests", status: "success", detail: "Jest/Vitest coverage > 90%" },
  { id: 3, name: "AI Vulnerability Scan", status: "processing", detail: "Gemini analyzing code patterns for security flaws" },
  { id: 4, name: "Build Containers", status: "pending", detail: "Docker multi-stage builds (Web, API, Worker)" },
  { id: 5, name: "Integration Tests", status: "pending", detail: "E2E Cypress flows on Staging" },
  { id: 6, name: "Deploy to Production", status: "pending", detail: "Helm Chart upgrade, Blue/Green rollout" }
];

export const PROJECT_SCAFFOLD = {
    name: "parsam-monorepo",
    children: [
        { name: ".github", children: [{ name: "workflows", children: [{ name: "ci-cd.yml" }] }] },
        { name: "apps", children: [
            { name: "web", children: [{ name: "src" }, { name: "package.json" }, { name: "Dockerfile" }] },
            { name: "desktop", children: [{ name: "src-tauri" }, { name: "package.json" }] },
            { name: "mobile", children: [{ name: "lib" }, { name: "pubspec.yaml" }] },
            { name: "admin", children: [{ name: "src" }, { name: "Dockerfile" }] }
        ]},
        { name: "packages", children: [
            { name: "core", children: [{ name: "src" }, { name: "package.json" }] },
            { name: "ui-kit", children: [{ name: "src" }, { name: "package.json" }] }
        ]},
        { name: "infra", children: [
            { name: "k8s", children: [{ name: "deployment.yaml" }, { name: "service.yaml" }] },
            { name: "terraform", children: [{ name: "main.tf" }, { name: "variables.tf" }] }
        ]},
        { name: "docker-compose.yml" },
        { name: "nx.json" }
    ]
};

export const DEPLOYMENT_SCRIPTS = {
    docker: `# Dockerfile for Web App
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`,

    k8s: `# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: parsam-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: parsam-web
  template:
    metadata:
      labels:
        app: parsam-web
    spec:
      containers:
      - name: parsam-web
        image: registry.parsamstudio.com/web:latest
        ports:
        - containerPort: 80
        env:
        - name: API_URL
          value: "https://api.parsamstudio.com"`,

    terraform: `# Terraform AWS Setup
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "parsam_assets" {
  bucket = "parsam-secure-assets"
  acl    = "private"
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}`,
    
    ci_cd: `# GitHub Actions CI/CD
name: Production Build
on:
  push:
    branches: [ "main" ]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20.x'
    - run: npm ci
    - run: npm test
    - name: Build Docker
      run: docker build . -t parsam-web:latest
    - name: Run AI Security Scan
      run: ./scripts/ai-audit.py --target ./src`
};

export const AI_SCRIPTS = {
    worker_py: `# AI Worker (Python)
import google.generativeai as genai
import os

def process_queue_item(item):
    if item.type == 'OCR':
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(["Extract text:", item.image])
        return response.text
        
    elif item.type == 'EMBEDDING':
        # Generate vector for semantic search
        embedding = genai.embed_content(
            model="models/text-embedding-004",
            content=item.text,
            task_type="retrieval_document"
        )
        return embedding['embedding']`
};
