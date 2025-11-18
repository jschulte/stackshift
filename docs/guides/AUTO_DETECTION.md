# Widget Type Auto-Detection

**How StackShift automatically detects widget/module types**

---

## Detection Order (Top to Bottom)

StackShift checks patterns in this order during Gear 1 (Analyze):

### 1. Osiris Widget Service

**Pattern:** Repository name starts with `ws-`

```bash
REPO_NAME=$(basename $(pwd))
if [[ $REPO_NAME == ws-* ]]; then
  ROUTE="osiris"
  TYPE="Osiris Widget Service"
fi
```

**Characteristics:**
- Repo name: `ws-vehicle-details`, `ws-hours`, `ws-contact`, etc.
- Has `ws-scripts` dependency in package.json
- Has `src/containers/Widget.jsx`
- Has `config/prefs.json`, `config/feature-flags.json`

**Analysis includes:**
- Widget code
- ws-scripts infrastructure
- wsm-* module dependencies
- ddc-* library dependencies

---

### 2. Osiris Module

**Pattern:** Repository name starts with `wsm-` or `ddc-`

```bash
if [[ $REPO_NAME == wsm-* ]] || [[ $REPO_NAME == ddc-* ]]; then
  ROUTE="osiris-module"
  TYPE="Osiris Shared Module"
fi
```

**Characteristics:**
- Repo name: `wsm-pricing-display`, `wsm-incentive-display`, `ddc-track-event`
- React component library (usually)
- Does NOT have ws-scripts dependency
- Has package.json with React as peer dependency

**Analysis includes:**
- Module business logic
- Configuration options (PropTypes/TypeScript interfaces)
- Business rules and calculations
- Data contracts (inputs/outputs)
- Edge case handling

---

### 3. CMS-web V9 Velocity Widget

**Pattern:** Directory structure matches `cms-web/htdocs/v9/widgets/{category}/{name}/{version}/`

```bash
if [ -f "widget.vm" ] && [[ $(pwd) == */v9/widgets/* ]]; then
  ROUTE="cms-v9"
  TYPE="CMS-web V9 Velocity Widget"
fi
```

**Characteristics:**
- Has `widget.vm` file (Velocity template)
- Located in `cms-web/htdocs/v9/widgets/`
- Portlet XML in `cms-web/deploy/widgets/v9/`
- Java backend in `cms/src/.../portlets/`

**Analysis includes:**
- Velocity template logic
- Component dependency tree (5-7 levels deep)
- Helper object usage ($helper, $npvresourcetool, etc.)
- Portlet configuration (preferences)
- Java backend business logic
- Conditional branches and business rules

**Delegates to:** `cms-web-widget-analyzer` agent

---

### 4. CMS-web V9 Viewmodel Widget

**Pattern:** Directory structure matches `cms-web/htdocs/v9/viewmodel/widgets/{name}/`

```bash
if [[ $(pwd) == */v9/viewmodel/widgets/* ]]; then
  ROUTE="cms-viewmodel"
  TYPE="CMS-web V9 Viewmodel Widget (Groovy)"
fi
```

**Characteristics:**
- Located in `cms-web/htdocs/v9/viewmodel/widgets/`
- Groovy-based instead of Velocity
- Simpler than V9 Velocity widgets

**Analysis includes:**
- Groovy viewmodel logic
- Component usage
- Java backend integration
- Business rules

**Delegates to:** `cms-web-widget-analyzer` agent (Groovy mode)

---

### 5. Generic Application (Fallback)

**Pattern:** None of the above match

```bash
# Default route - analyze as generic application
ROUTE="greenfield" # OR "brownfield" (user chooses)
TYPE="Generic Application"
```

**Characteristics:**
- Standard web/mobile/API application
- Common tech stacks (React, Vue, Python, Go, etc.)
- No special Cox patterns

**Analysis includes:**
- Standard reverse engineering workflow
- Tech stack detection
- Architecture analysis

---

## Detection Implementation

**Location:** `analyze-tool.ts` and `analyze/SKILL.md`

```typescript
async detectWidgetType(directory: string): Promise<{
  route: string;
  type: string;
  delegate_to?: string;
}> {
  const projectName = path.basename(directory);
  const packageJson = await this.loadPackageJson(directory);

  // 1. Check for Osiris Widget (ws-*)
  if (projectName.startsWith('ws-')) {
    if (packageJson?.dependencies?.['ws-scripts'] ||
        packageJson?.devDependencies?.['ws-scripts']) {
      return {
        route: 'osiris',
        type: 'Osiris Widget Service'
      };
    }
  }

  // 2. Check for Osiris Module (wsm-*, ddc-*)
  if (projectName.startsWith('wsm-') || projectName.startsWith('ddc-')) {
    return {
      route: 'osiris-module',
      type: 'Osiris Shared Module'
    };
  }

  // 3. Check for CMS-web V9 Velocity Widget
  if (await fileExists(path.join(directory, 'widget.vm'))) {
    const parentPath = path.dirname(path.dirname(path.dirname(directory)));
    if (parentPath.endsWith('/v9/widgets')) {
      return {
        route: 'cms-v9',
        type: 'CMS-web V9 Velocity Widget',
        delegate_to: 'cms-web-widget-analyzer'
      };
    }
  }

  // 4. Check for CMS-web V9 Viewmodel Widget
  const cwd = directory;
  if (cwd.includes('/v9/viewmodel/widgets/')) {
    return {
      route: 'cms-viewmodel',
      type: 'CMS-web V9 Viewmodel Widget (Groovy)',
      delegate_to: 'cms-web-widget-analyzer'
    };
  }

  // 5. Fallback - Generic application
  return {
    route: null, // User chooses greenfield or brownfield
    type: 'Generic Application'
  };
}
```

---

## Route Summary

| Route | Auto-Detect Pattern | Tech Stack | Agent | Output |
|-------|-------------------|------------|-------|--------|
| **osiris** | ws-* repo name | React + ws-scripts | Built-in | Widget + modules + ws-scripts |
| **osiris-module** | wsm-* or ddc-* repo | React library | Built-in | Module logic only |
| **cms-v9** | widget.vm in v9/widgets/ | Velocity + Java | cms-web-widget-analyzer | V9 widget full chain |
| **cms-viewmodel** | v9/viewmodel/widgets/ | Groovy + Java | cms-web-widget-analyzer | Viewmodel logic |
| **greenfield** | User choice | Any | Built-in | Business logic only |
| **brownfield** | User choice | Any | Built-in | Business + tech |

---

## User Experience

**Auto-detected (no user input needed):**
```
$ cd ~/git/osiris/ws-hours
$ stackshift analyze

✅ Auto-detected: Osiris Widget Service
Route: osiris
Analyzing: Widget + ws-scripts + modules...
```

**User choice required:**
```
$ cd ~/git/my-rails-app
$ stackshift analyze

🤔 No pattern detected - please choose route:
A) Greenfield - Extract business logic for rebuild
B) Brownfield - Manage existing with specs

Choose: A
Route: greenfield
Analyzing: Generic application...
```

**CMS-web widget (delegated):**
```
$ cd ~/git/cms-web/htdocs/v9/widgets/contact/info/v1
$ stackshift analyze

✅ Auto-detected: CMS-web V9 Velocity Widget
Route: cms-v9
Delegating to: cms-web-widget-analyzer agent

Analyzing:
- Velocity template nesting (5 levels deep)
- Helper object dependencies (23 calls)
- Java backend portlet logic
- 52 widget preferences
- Business rules (47 conditionals)
...
```

---

## Benefits

✅ **Zero configuration** - Just run StackShift, it figures it out
✅ **Specialized analysis** - Each widget type gets appropriate analysis
✅ **Delegated complexity** - Complex patterns handled by specialized agents
✅ **Consistent output** - All produce same documentation format
✅ **Extensible** - Easy to add new widget type detection

---

**Next:** Update analyze tool, state-manager, and security.ts with new routes.
