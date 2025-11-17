# ws-scripts Capabilities Reference

**Repository:** `~/git/osiris/ws-scripts`
**Purpose:** Foundational infrastructure for all Osiris Widget Services (ws-* repos)

ws-scripts is a **required dependency** for all Osiris widgets that provides comprehensive build tooling, runtime infrastructure, and common data integrations.

---

## Core Infrastructure Provided

### 1. Build & Development Tooling
- **Webpack configuration** - Pre-configured bundling for widgets
- **Babel transpilation** - JSX, TypeScript, modern ES features
- **Development server** - Local widget development with hot reload
- **Production builds** - Optimized bundles with code splitting
- **Testing framework** - Jest configuration for unit/integration tests
- **Local CMS integration** - Test widgets in CMS locally

### 2. Server-Side Rendering (SSR)
- **Redux store management** - Server/client hydration
- **Custom middleware support** - Widget-specific Redux middleware
- **Store configuration** - `src/server/store.js` configure() hook
- **Request context** - Access to CMS request data during SSR

### 3. Common Data Integrations

ws-scripts automatically provides widgets with:

#### Preferences System
- **Widget preferences** - Defined in `config/prefs.json`
- **Device-specific prefs** - Desktop/mobile variants
- **CMS integration** - Editable via Composer
- **Validation** - Type checking, min/max, options
- **Access via `<Common />` render prop** or `usePreferences()` hook

#### Feature Flags
- **LaunchDarkly integration** - Production feature flag provider
- **Configuration** - Defined in `config/feature-flags.json`
- **Targeting support** - User/site/custom attribute targeting
- **Default values** - Fallback when LaunchDarkly unavailable
- **Access via `<Common />` render prop** or `useFlags()` hook

#### Labels (i18n)
- **Label management** - Defined in `config/labels.json`
- **Internationalization** - Multi-language support
- **CMS label system** - Integration with enterprise labels
- **Access via `<Common />` render prop** or `useLabels()` hook

#### Environment Detection
- **Device detection** - Desktop/mobile/tablet
- **Browser detection** - User agent parsing
- **Location info** - Geographic data if available
- **Access via `<Environment />` module**

### 4. Runtime Modules

Built-in modules provided by ws-scripts:

#### `ws-scripts/modules/common`
Provides `<Common />` render prop with:
- `preferences` - Widget configuration
- `flags` - Feature flags from LaunchDarkly
- `labels` - i18n labels
- `sitemap` - CMS sitemap data

#### `ws-scripts/modules/environment`
Provides `<Environment />` render prop with:
- Device type (desktop/mobile/tablet)
- Browser info
- User agent details

### 5. Provided Libraries

Pre-included in all widgets (no need to install):
- **react** & **react-dom** - UI framework
- **redux** & **react-redux** - State management
- **@reduxjs/toolkit** - Modern Redux patterns
- **react-bootstrap** - Bootstrap components
- **Fetch API** - HTTP requests (node-fetch on server)
- **Intl API** - Date/number formatting with polyfills
- **hysterics** - Circuit breakers, timeouts, fault tolerance

### 6. Deployment & Infrastructure

- **Docker support** - Containerization
- **Terraform integration** - AWS infrastructure as code
- **CloudFactory setup** - CDN and static asset delivery
- **NGINX proxy configuration** - Routing and caching
- **Monitoring** - Built-in New Relic integration
- **Logging** - Structured logging support
- **Basic authentication** - Dev/test environment protection

### 7. Configuration Files

ws-scripts expects/supports these config files:

| File | Purpose |
|------|---------|
| `config/prefs.json` | Widget preference definitions |
| `config/feature-flags.json` | Feature flag defaults |
| `config/labels.json` | i18n labels |
| `config/request-data.json` | Mock request data for local dev |
| `config/static-assets.json` | CDN asset configuration |
| `config/widget-cache.json` | Caching strategies |
| `config/widget-nginx-proxy.json` | Proxy configuration |

### 8. Required Widget Contract

Every widget must provide:

| File/Export | Purpose |
|-------------|---------|
| `src/containers/Widget.jsx` | Main React component (default export) |
| `src/server/endpoints.js` | API endpoints (if any) |
| `src/server/store.js` | `configure()` function for SSR |
| `src/middleware/index.js` | Custom Redux middleware array |
| `config/static-assets.json` | Static asset definitions |
| `config/request-data.json` | Request data schema |

---

## Business Logic Implications

When analyzing Osiris widgets, ws-scripts provides critical infrastructure that affects business logic:

### Server-Side Logic
- **Data fetching** - Widgets can fetch data server-side in `configure()`
- **Request context** - Access to CMS request data, query params
- **Status codes** - Custom HTTP status handling (204 No Content, etc.)
- **Error handling** - Structured error responses

### Client-Side Logic
- **State hydration** - Redux store populated on server, rehydrated on client
- **Common data** - Preferences, flags, labels available without fetching
- **Device adaptation** - Desktop/mobile rendering differences
- **Feature toggling** - Conditional rendering based on flags

### Configuration-Driven Behavior
- **Preferences control UX** - Many widget behaviors driven by preferences
- **Feature flags control features** - Gradual rollout, A/B testing
- **Labels control i18n** - All text externalized to labels

---

## For StackShift Analysis

When analyzing a ws-* widget:

1. **Always include ws-scripts as infrastructure dependency**
2. **Document preference-driven behaviors** from `config/prefs.json`
3. **Document feature-flag-gated features** from `config/feature-flags.json`
4. **Document server-side data fetching** in `src/server/store.js`
5. **Document custom endpoints** in `src/server/endpoints.js`
6. **Reference ws-scripts modules** used (`Common`, `Environment`)

### Business Logic Extraction Checklist

- [ ] Widget component tree (`src/containers/Widget.jsx`)
- [ ] Server store configuration (`src/server/store.js`)
- [ ] Custom API endpoints (`src/server/endpoints.js`)
- [ ] Preference definitions (`config/prefs.json`)
- [ ] Feature flags (`config/feature-flags.json`)
- [ ] Labels/i18n (`config/labels.json`)
- [ ] Custom Redux middleware (`src/middleware/`)
- [ ] wsm-* module dependencies (separate repos)
- [ ] ddc-* library dependencies
- [ ] **ws-scripts modules** (Common, Environment)
- [ ] **ws-scripts infrastructure** (SSR, build, deployment)

---

## Documentation Location

Full ws-scripts documentation: `~/git/osiris/ws-scripts/docs/`

**Key docs for business logic:**
- `modules-common.md` - Common data render prop
- `modules-environment.md` - Environment detection
- `preferences.md` - Preference system
- `feature-flags.md` - Feature flag integration
- `labels.md` - i18n labels
- `request-data.md` - CMS request context
- `required-code.md` - Widget contract
- `endpoints.md` - Custom API endpoints
- `redux.md` - State management patterns

**Total:** 42 documentation files covering all aspects of Osiris widget development.

---

## Version

ws-scripts is actively maintained and versioned. Check widget's `package.json` for version.

**Common patterns:**
- v19.x - v21.x (current versions in production)
- Breaking changes documented in `CHANGELOG.md`
