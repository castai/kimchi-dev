# Rust Extensions Rewrite Plan

## Executive Summary

This document outlines a comprehensive plan to rewrite the TypeScript extensions in `./src/extensions/` to Rust. The rewrite aims to achieve:

- **10-100x performance improvement** for CPU-intensive operations (text processing, search)
- **Memory efficiency** (Rust's zero-cost abstractions vs Node.js heap)
- **Native multithreading** for parallel operations (search indexing, content conversion)
- **Node.js interop** via NAPI-RS for seamless integration with the existing TypeScript codebase

---

## Current Module Analysis

| Module | Lines (TS) | Complexity | Performance Critical | Rewrite Priority |
|--------|------------|------------|---------------------|------------------|
| `mcp-adapter/` | ~3,500 | Very High | Medium | Phase 3 |
| `orchestration/` | ~800 | High | Medium | Phase 2 |
| `web-fetch/` | ~900 | Medium | High | Phase 1 |
| `web-search/` | ~350 | Low | Medium | Phase 2 |
| `subagent.ts` | ~450 | High | High | Phase 1 |
| `tags.ts` | ~550 | Medium | Low | Phase 4 |
| `telemetry.ts` | ~200 | Low | Low | Phase 4 |
| `prompt-summary.ts` | ~150 | Low | Low | Phase 4 |
| `bash-collapse.ts` | ~80 | Low | Medium | Phase 3 |
| `format.ts` | ~15 | Very Low | Low | Phase 5 |
| `spinner.ts` | ~40 | Very Low | Low | Phase 5 |

---

## 1. Crate Structure Architecture

### 1.1 Multi-Crate Workspace (Recommended)

```
rust-extensions/
├── Cargo.toml                    # Workspace root
├── crates/
│   ├── pi-extensions-core/       # Core types, error handling, traits
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── error.rs          # Unified error types
│   │   │   ├── traits.rs         # Extension, Tool, Command traits
│     │   │   └── types.rs        # Shared data structures
│   │   └── Cargo.toml
│   │
│   ├── pi-web/                   # Web operations (fetch + search)
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── fetch/
│   │   │   │   ├── mod.rs
│   │   │   │   ├── browser.rs    # BrowserPool equivalent
│   │   │   │   ├── fetcher.rs    # HTTP fetching logic
│   │   │   │   ├── converter.rs  # HTML→Markdown/Plain text
│   │   │   │   ├── validator.rs  # URL validation & SSRF protection
│   │   │   │   └── cache.rs      # In-memory LRU cache
│   │   │   └── search/
│   │   │       ├── mod.rs
│   │   │       └── client.rs     # Search API client
│   │   └── Cargo.toml
│   │
│   ├── pi-mcp/                   # MCP adapter
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── server.rs         # Server connection management
│   │   │   ├── lifecycle.rs      # Lifecycle manager
│   │   │   ├── search.rs         # BM25 + regex search
│   │   │   ├── proxy.rs          # Proxy tool execution
│   │   │   ├── auth.rs           # OAuth flow
│   │   │   └── types.rs          # MCP types
│   │   └── Cargo.toml
│   │
│   ├── pi-orchestration/         # Prompt orchestration
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── registry.rs       # Model registry
│   │   │   ├── transformer.rs    # Prompt transformation
│   │   │   └── context.rs        # Context file loading
│   │   └── Cargo.toml
│   │
│   ├── pi-subagent/              # Subagent spawning
│   │   ├── src/
│   │   │   ├── lib.rs
│   │   │   ├── spawn.rs          # Process spawning
│   │   │   ├── parser.rs         # Event parsing (JSONL)
│   │   │   └── stream.rs         # Stream handling
│   │   └── Cargo.toml
│   │
│   ├── pi-telemetry/             # Telemetry (lightweight)
│   │   ├── src/
│   │   │   └── lib.rs
│   │   └── Cargo.toml
│   │
│   └── pi-napi/                  # NAPI-RS bindings layer
│       ├── src/
│       │   ├── lib.rs
│       │   ├── web.rs            # web_fetch/web_search bindings
│       │   ├── mcp.rs            # mcp adapter bindings
│       │   ├── orchestration.rs  # orchestration bindings
│       │   └── subagent.rs       # subagent bindings
│       └── Cargo.toml
│
├── napi/
│   └── index.d.ts               # Generated TypeScript definitions
│
└── benches/                     # Criterion benchmarks
    └── comparison.rs
```

### 1.2 Alternative: Single Crate with Features

For simpler deployment, a single crate with feature flags:

```toml
[features]
default = ["web", "mcp", "orchestration", "subagent"]
web = ["dep:reqwest", "dep:html5ever", "dep:turndown"]
mcp = ["dep:serde_json", "dep:tokio-tungstenite"]
orchestration = []
subagent = ["dep:tokio-process"]
telemetry = []
```

**Recommendation**: Start with multi-crate for better compile times and modularity.

---

## 2. Module Mapping: TypeScript → Rust

### 2.1 Core Traits (pi-extensions-core)

```rust
// traits.rs
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[async_trait]
pub trait Extension: Send + Sync {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    
    async fn on_session_start(&self, ctx: &ExtensionContext);
    async fn on_session_shutdown(&self, ctx: &ExtensionContext);
}

#[async_trait]
pub trait Tool: Send + Sync {
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn parameters_schema(&self) -> serde_json::Value;
    
    async fn execute(
        &self,
        params: serde_json::Value,
        signal: AbortSignal,
    ) -> Result<ToolResult, ToolError>;
}

#[async_trait]
pub trait ToolRenderer: Send + Sync {
    fn render_call(&self, args: &serde_json::Value, theme: &Theme) -> RenderedComponent;
    fn render_result(&self, result: &ToolResult, options: RenderOptions, theme: &Theme) -> RenderedComponent;
}
```

### 2.2 Web Fetch Module (pi-web::fetch)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `browser-pool.ts` | `browser.rs` | Use `chromiumoxide` or playright-rs |
| `page-fetcher.ts` | `fetcher.rs` | `reqwest` for native, `chromiumoxide` for browser |
| `content-converter.ts` | `converter.rs` | `html5ever` + `markup5ever_rcdom` for DOM, custom markdown |
| `url-validator.ts` | `validator.rs` | Port exact validation logic |
| `cache.ts` | `cache.rs` | `dashmap` + `tokio::time` for TTL |
| `execute-handler.ts` | `mod.rs` | Orchestrate components |

**Key Optimizations:**
- Use `html5ever` (Mozilla's HTML5 parser) instead of `domino` (faster, Rust-native)
- Parallel CSS selector matching with `rayon`
- Zero-copy string operations where possible

### 2.3 Web Search Module (pi-web::search)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `execute-handler.ts` | `client.rs` | `reqwest` with timeouts, streaming JSON |
| Result formatting | `formatter.rs` | Pre-allocate string capacity |

### 2.4 MCP Adapter Module (pi-mcp)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `server-manager.ts` | `server.rs` | `tokio::process` for stdio, `reqwest` for HTTP |
| `lifecycle.ts` | `lifecycle.rs` | `tokio::time::interval` for health checks |
| `bm25.ts` | `search.rs` | Use `tantivy` or custom BM25 (below) |
| `proxy-modes.ts` | `proxy.rs` | Main tool execution logic |
| `mcp-auth-flow.ts` | `auth.rs` | OAuth2 flow with `oauth2` crate |

**BM25 Implementation:**
```rust
// Custom BM25 index for tool search
pub struct Bm25Index {
    docs: Vec<ToolDocument>,
    doc_freq: HashMap<String, usize>,
    avg_len: f32,
    k1: f32,
    b: f32,
}

impl Bm25Index {
    pub fn search(&self, query: &str, limit: usize) -> Vec<SearchResult> {
        // SIMD-accelerated scoring with packed_simd2
    }
}
```

### 2.5 Orchestration Module (pi-orchestration)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `model-registry/` | `registry.rs` | Static assertions for model validation |
| `prompt-transformer/` | `transformer.rs` | String templating with `tera` or `handlebars` |
| `prompt-enrichment.ts` | `enrichment.rs` | Event hooks |

### 2.6 Subagent Module (pi-subagent)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `spawn()` | `spawn.rs` | `tokio::process::Command` for spawning |
| `parseSubagentEvent()` | `parser.rs` | Streaming JSONL parser with `serde_json` |
| Process management | `stream.rs` | Async stdout/stderr handling |

### 2.7 Tags Module (pi-telemetry)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `TagManager` | `tags/manager.rs` | File-backed config with `serde` |
| Validation | `tags/validator.rs` | Regex with `regex` crate |
| Footer formatting | `tags/display.rs` | Theme-aware rendering |

### 2.8 Telemetry Module (pi-telemetry)

| TypeScript | Rust | Notes |
|------------|------|-------|
| `sendLog()` | `telemetry.rs` | `reqwest` with OTLP protocol |
| Event handlers | hooks in `lib.rs` | Extension lifecycle hooks |

---

## 3. Key Dependencies

### 3.1 Core Async Runtime

```toml
[dependencies]
# Async runtime
tokio = { version = "1.35", features = ["full"] }
tokio-util = "0.7"

# Async traits
async-trait = "0.1"
futures = "0.3"
```

### 3.2 HTTP & Web

```toml
[dependencies]
# HTTP client
reqwest = { version = "0.11", features = ["json", "stream", "rustls-tls"] }

# WebSocket (for MCP SSE streaming)
tokio-tungstenite = { version = "0.21", features = ["rustls-tls-webpki-roots"] }

# HTML parsing for content conversion
html5ever = "0.27"
markup5ever-rcdom = "0.3"
select = "0.6"  # CSS selector engine

# Markdown generation
pulldown-cmark = "0.9"  # Or use custom turndown port
comrak = "0.21"         # Alternative markdown parser

# URL parsing & validation
url = "2.5"
regex = "1.10"
```

### 3.3 Browser Automation

```toml
[dependencies]
# Chrome DevTools Protocol
chromiumoxide = { version = "0.5", features = ["tokio-runtime"] }
# Or use playwright-rs for Playwright compatibility:
# playwright = "0.1"
```

### 3.4 Serialization & Schema

```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
schemars = "0.8"        # JSON Schema generation
validator = { version = "0.16", features = ["derive"] }
```

### 3.5 Search & Indexing

```toml
[dependencies]
# Full-text search (optional over BM25 custom impl)
tantivy = "0.21"

# Fuzzy string matching
sublime_fuzzy = "0.7"
strsim = "0.11"
```

### 3.6 Caching & Data Structures

```toml
[dependencies]
# Concurrent hash map
dashmap = "5.5"

# LRU cache
lru = "0.12"

# Time handling
chrono = { version = "0.4", features = ["serde"] }
```

### 3.7 NAPI-RS for Node.js Interop

```toml
[dependencies]
napi = { version = "2.14", features = ["napi9", "tokio_rt"] }
napi-derive = "2.14"

[build-dependencies]
napi-build = "2.1"
```

### 3.8 Observability

```toml
[dependencies]
# Logging
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }

# Metrics (optionally export to OTLP)
opentelemetry = "0.22"
opentelemetry-otlp = "0.15"
```

---

## 4. Integration Strategy: NAPI-RS

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Node.js Runtime                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ TypeScript   │  │ TypeScript   │  │ TypeScript   │       │
│  │ ExtensionAPI │  │ Tool API     │  │ Commands     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │              │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐       │
│  │ NAPI-RS      │  │ NAPI-RS      │  │ NAPI-RS      │       │
│  │ Bindings     │  │ Bindings     │  │ Bindings     │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                    Rust Runtime (Tokio)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ pi-web       │  │ pi-mcp       │  │ pi-subagent  │       │
│  │              │  │              │  │              │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Example NAPI Binding

```rust
// pi-napi/src/web.rs
use napi::bindgen_prelude::*;
use napi_derive::napi;

#[napi]
pub struct WebFetchTool {
    inner: pi_web::fetch::WebFetch,
}

#[napi]
impl WebFetchTool {
    #[napi(constructor)]
    pub fn new() -> Self {
        Self {
            inner: pi_web::fetch::WebFetch::new(),
        }
    }

    #[napi]
    pub async fn execute(&self, params: String) -> Result<String> {
        let params: WebFetchParams = serde_json::from_str(&params)
            .map_err(|e| Error::new(Status::InvalidArg, e.to_string()))?;
        
        let result = self.inner.fetch(params).await
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))?;
        
        serde_json::to_string(&result)
            .map_err(|e| Error::new(Status::GenericFailure, e.to_string()))
    }
}

#[napi(object)]
#[derive(Deserialize)]
pub struct WebFetchParams {
    pub url: String,
    pub format: Option<String>,
    pub timeout: Option<u32>,
}
```

### 4.3 TypeScript Declaration Generation

Using `napi-rs` CLI:

```bash
# Generates TypeScript definitions from Rust code
npx @napi-rs/cli build --platform --release

# Output: index.d.ts
export interface WebFetchParams {
  url: string;
  format?: string;
  timeout?: number;
}

export class WebFetchTool {
  constructor();
  execute(params: string): Promise<string>;
}
```

### 4.4 ABI Stability Strategy

For compatibility across Node.js versions:

1. **Use napi-rs**: Handles ABI compatibility automatically
2. **Prebuilt binaries**: Use `napi-rs` distribution with prebuilt binaries for:
   - Linux (x64, aarch64, musl)
   - macOS (x64, aarch64)
   - Windows (x64)

```yaml
# .github/workflows/release.yml (excerpt)
- uses: actions/setup-node@v4
- uses: napi-rs/napi-rs-action@v1
  with:
    package_manager: 'pnpm'
    target: 'x86_64-apple-darwin'
```

---

## 5. Error Handling Patterns

### 5.1 Unified Error Type

```rust
// pi-extensions-core/src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ExtensionError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("URL validation failed: {reason}")]
    UrlValidation { reason: String },
    
    #[error("Fetch error ({category}): {message}")]
    Fetch {
        category: FetchErrorCategory,
        message: String,
    },
    
    #[error("MCP server error: {server} - {message}")]
    McpServer {
        server: String,
        message: String,
    },
    
    #[error("Subagent error: {reason}")]
    Subagent { reason: String },
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("{0}")]
    Custom(String),
}

#[derive(Debug, Clone, Copy)]
pub enum FetchErrorCategory {
    Timeout,
    Http,
    Network,
    Binary,
    TooLarge,
    Unknown,
}
```

### 5.2 Result Type Alias

```rust
// pi-extensions-core/src/lib.rs
pub type Result<T> = std::result::Result<T, ExtensionError>;
```

### 5.3 NAPI Error Conversion

```rust
// pi-napi/src/error.rs
use napi::{Error, Status};

impl From<ExtensionError> for Error {
    fn from(e: ExtensionError) -> Self {
        let status = match &e {
            ExtensionError::UrlValidation { .. } => Status::InvalidArg,
            ExtensionError::Serialization(_) => Status::InvalidArg,
            _ => Status::GenericFailure,
        };
        Error::new(status, e.to_string())
    }
}
```

---

## 6. Performance Optimizations by Module

### 6.1 Web Fetch (`pi-web::fetch`)

| Area | Current (TS) | Optimized (Rust) | Expected Gain |
|------|--------------|------------------|---------------|
| HTML Parsing | `domino` (JS) | `html5ever` (Rust) | 5-10x faster |
| URL Validation | Regex in JS | Compiled regex + SIMD | 3-5x faster |
| Content Conversion | DOM manipulation | Streaming parser | 2-3x faster |
| Caching | Native Map | `dashmap` (lock-free) | Better concurrency |

**Memory Optimization:**
- Use `Arc<str>` for shared strings (URL, domain)
- Pre-allocate buffer capacity for known content sizes
- Streaming HTML parsing without full DOM materialization

### 6.2 MCP Adapter (`pi-mcp`)

| Area | Current (TS) | Optimized (Rust) | Expected Gain |
|------|--------------|------------------|---------------|
| BM25 Search | JS implementation | SIMD-accelerated scoring | 10-50x faster |
| Tool Registry | Map lookups | Perfect hash (phf) | O(1) guaranteed |
| Connection Pool | Native EventEmitter | Tokio channels | Lower latency |

**BM25 Optimization:**
```rust
// Use packed_simd2 for vectorized term frequency scores
use packed_simd::f32x8;

pub fn score_batch(&self, docs: &[Document], query: &Query) -> Vec<f32> {
    docs.chunks_exact(8)
        .map(|chunk| {
            let scores = f32x8::new(
                self.score(&chunk[0], query),
                self.score(&chunk[1], query),
                // ...
            );
            scores
        })
        .collect()
}
```

### 6.3 Subagent (`pi-subagent`)

| Area | Current (TS) | Optimized (Rust) | Expected Gain |
|------|--------------|------------------|---------------|
| Process Spawning | `child_process` | `tokio::process` | Lower overhead |
| JSONL Parsing | `JSON.parse()` | `simd_json` | 2-4x faster |
| Stream Buffering | Node.js streams | `tokio::io::BufReader` | Zero-copy where possible |

**SIMD JSON Parsing:**
```rust
use simd_json;

pub fn parse_events_chunk(chunk: &mut [u8]) -> Vec<SubagentEvent> {
    // simd_json operates on mutable byte slices (in-place parsing)
    let mut events = Vec::new();
    for line in chunk.split(|b| *b == b'\n') {
        if let Ok(event) = simd_json::serde::from_slice(line) {
            events.push(event);
        }
    }
    events
}
```

### 6.4 Orchestration (`pi-orchestration`)

| Area | Current (TS) | Optimized (Rust) | Expected Gain |
|------|--------------|------------------|---------------|
| Template Rendering | String replace | `tinytemplate` orcompiled | 5-10x faster |
| Context File Loading | `fs.readFileSync` | `memmap2` + async IO | Faster for large files |
| Model Registry | Array find | `phf` map | O(1) lookups |

---

## 7. Implementation Phases

### Phase 1: Core Web & Subagent (Weeks 1-4)
**Focus**: Highest-performance critical paths

**Deliverables:**
- [ ] `pi-extensions-core` crate with error types and traits
- [ ] `pi-web` crate with fetch + search
- [ ] `pi-subagent` crate with process spawning
- [ ] `pi-napi` bindings for web + subagent
- [ ] Benchmarks showing vs TypeScript baseline

**Performance Targets:**
- Web fetch: 2x faster end-to-end
- HTML conversion: 5x faster
- Subagent spawning: 1.5x faster

### Phase 2: Orchestration (Weeks 5-6)
**Focus**: Prompt transformation pipeline

**Deliverables:**
- [ ] `pi-orchestration` crate
- [ ] Model registry with static compilation
- [ ] Prompt template engine
- [ ] Context file loading optimization

**Performance Targets:**
- Prompt transformation: 3x faster
- Context file discovery: Reduce I/O ops

### Phase 3: MCP Adapter (Weeks 7-10)
**Focus**: Complex async system with search

**Deliverables:**
- [ ] `pi-mcp` crate with server management
- [ ] BM25 search index (SIMD-accelerated)
- [ ] OAuth authentication flow
- [ ] Lifecycle management
- [ ] `pi-napi` bindings for MCP

**Performance Targets:**
- BM25 search: 10x faster
- Tool discovery: 2x faster
- Connection pool: Lower memory overhead

### Phase 4: Telemetry & Tags (Weeks 11-12)
**Focus**: Low-complexity modules for completeness

**Deliverables:**
- [ ] `pi-telemetry` crate
- [ ] Tag management
- [ ] Footer status rendering

### Phase 5: Remaining Utilities (Week 13)
**Focus**: Clean up and polish

**Deliverables:**
- [ ] `format.ts` → utility functions
- [ ] `spinner.ts` → TUI integration
- [ ] `bash-collapse.ts` → tool wrapper
- [ ] `prompt-summary.ts` → message renderer

### Phase 6: Integration & Rollout (Week 14-16)
**Focus**: Production readiness

**Deliverables:**
- [ ] CI/CD for binary builds
- [ ] Feature flags for gradual rollout
- [ ] Performance regression testing
- [ ] Documentation and migration guide

---

## 8. Migration Strategy

### 8.1 Gradual Migration with Feature Flags

```typescript
// In the TypeScript codebase
const USE_RUST_EXTENSIONS = process.env.KIMCHI_USE_RUST_EXTENSIONS === '1';

async function loadWebFetch(): Promise<Tool> {
  if (USE_RUST_EXTENSIONS) {
    const { WebFetchTool } = await import('./native/web_fetch.node');
    return new WebFetchTool();
  }
  return import('./extensions/web-fetch/index.js').then(m => m.default);
}
```

### 8.2 Fallback Strategy

```rust
// In Rust NAPI bindings, catch panics and return errors
#[napi]
pub async fn execute_safe(&self, params: String) -> Result<String> {
    match std::panic::catch_unwind(|| {
        self.execute(params)
    }) {
        Ok(result) => result,
        Err(_) => Err(Error::new(
            Status::GenericFailure,
            "Rust extension panicked, please use JS fallback"
        )),
    }
}
```

---

## 9. Testing Strategy

### 9.1 Rust Unit Tests

```rust
// pi-web/src/fetch/validator.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_blocks_private_ip() {
        let result = validate_url("http://192.168.1.1/test");
        assert!(matches!(result, Err(ValidationError::PrivateIp)));
    }

    #[test]
    fn test_allows_public_url() {
        let result = validate_url("https://example.com/test");
        assert!(result.is_ok());
    }
}
```

### 9.2 Integration Tests with NAPI

```typescript
// __tests__/web-fetch-rust.test.ts
import { WebFetchTool } from '../native/web_fetch.node';
import { executeWebFetch } from '../src/extensions/web-fetch/execute-handler';

describe('WebFetch parity', () => {
    it('produces same output for same input', async () => {
        const params = { url: 'https://example.com', format: 'markdown' };
        
        const rustResult = await new WebFetchTool().execute(JSON.stringify(params));
        const tsResult = await executeWebFetch(params);
        
        expect(JSON.parse(rustResult)).toEqual(tsResult);
    });
});
```

### 9.3 Benchmarks

```rust
// benches/web_fetch.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_html_conversion(c: &mut Criterion) {
    let html = include_str!("../fixtures/large_page.html");
    
    c.bench_function("html_to_markdown", |b| {
        b.iter(|| {
            convert_content(black_box(html), black_box("https://example.com"), black_box("markdown"))
        });
    });
}

criterion_group!(benches, bench_html_conversion);
criterion_main!(benches);
```

---

## 10. Appendix: Code Examples

### 10.1 Complete Web Fetch Tool (Rust)

```rust
use async_trait::async_trait;
use serde::{Deserialize,