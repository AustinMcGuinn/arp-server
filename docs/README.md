# FiveM TypeScript Framework Documentation

Welcome to the documentation for the FiveM TypeScript Framework. This comprehensive guide covers everything from initial setup to advanced development patterns.

## Quick Links

- [Getting Started](./getting-started.md) - Installation and initial setup
- [Configuration](./configuration.md) - All configuration options
- [Architecture](./architecture.md) - System design and data flow

## For Server Owners

If you're setting up a FiveM server with this framework:

1. Start with the [Getting Started](./getting-started.md) guide
2. Review [Configuration](./configuration.md) for all available options
3. Check individual resource documentation for customization

## For Developers

If you're extending or contributing to the framework:

1. Read the [Architecture](./architecture.md) overview
2. Review the [Packages](#packages) documentation
3. Follow the [Development Guides](#development-guides)

---

## Packages

Shared internal packages used across the framework:

| Package | Description | Documentation |
|---------|-------------|---------------|
| `@framework/types` | TypeScript type definitions | [types.md](./packages/types.md) |
| `@framework/utils` | Shared utility functions | [utils.md](./packages/utils.md) |
| `@framework/ui` | SolidJS component library | [ui.md](./packages/ui.md) |

---

## Resources

FiveM resources that make up the framework:

### Core Resources

| Resource | Description | Documentation |
|----------|-------------|---------------|
| `[core]` | Core framework with player management | [core.md](./resources/core.md) |
| `[database]` | Database connection and schema | [database.md](./resources/database.md) |
| `[websocket]` | WebSocket server for external apps | [websocket.md](./resources/websocket.md) |

### Game Resources

| Resource | Description | Documentation |
|----------|-------------|---------------|
| `character-selection` | Character selection UI | [character-selection.md](./resources/character-selection.md) |
| `character-creation` | Character creation UI | [character-creation.md](./resources/character-creation.md) |
| `inventory` | Inventory system | [inventory.md](./resources/inventory.md) |
| `jobs` | Job system | [jobs.md](./resources/jobs.md) |
| `vehicles` | Vehicle ownership and garages | [vehicles.md](./resources/vehicles.md) |

---

## Apps

External applications:

| App | Description | Documentation |
|-----|-------------|---------------|
| Admin Panel | Web-based admin dashboard | [admin-panel.md](./admin-panel.md) |

---

## Development Guides

Guides for extending the framework:

| Guide | Description |
|-------|-------------|
| [Creating Resources](./development/creating-resources.md) | How to create new FiveM resources |
| [NUI Development](./development/nui-development.md) | Building UIs with SolidJS |
| [Events Reference](./development/events-reference.md) | Complete list of events and callbacks |

---

## Support

- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
