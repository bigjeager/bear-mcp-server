# Bear App MCP Server

A Model Context Protocol (MCP) server that provides integration with Bear App using its X-callback-URL scheme. This server enables AI assistants to interact with Bear notes, create new content, search, and manage tags.

## Features

- **Note Management**: Create, open, and modify notes with full metadata retrieval
- **Text Operations**: Add, append, prepend, or replace text in existing notes
- **Search**: Search through notes and tags with complete result data
- **Tag Management**: Get, open, rename, and delete tags with real-time data
- **Organization**: Archive, trash, and organize notes
- **Web Content**: Grab content from URLs to create notes with returned metadata
- **Special Views**: Access Today, Todo, and Untagged note collections with full note lists
- **Callback Integration**: Advanced x-success callback support for comprehensive data retrieval
- **Silent Operation**: Custom URL scheme prevents unwanted browser windows during callbacks

## Requirements

- macOS (Bear App is macOS only)
- Bear App installed and running
- Node.js 18+ 
- Bear API token (for some operations)

## Quick Installation
```bash
chmod +x ./setup.sh && ./setup.sh
```

## Manual Installation

1. Clone and go to the project:
```bash
git clone https://github.com/bigjeager/bear-mcp-server.git
cd bear-mcp-server/
```
2. Install dependencies:
```bash
npm install
```
3. Build the project:
```bash
npm run build
```
4. Build binaries:
```bash
/path/to/bear-mcp-server/dist/index.js
```

## Getting Bear API Token

Some operations require a Bear API token:

**On macOS:**
1. Open Bear App
2. Go to `Help` → `Advanced` → `API Token` → `Copy Token`
3. The token will be copied to your clipboard

## Configuration

Add the server to your MCP client configuration. For Claude Desktop, add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bear": {
      "command": "node",
      "args": ["/path/to/bear-mcp-server/dist/index.js"],
      "env": {
        "BEAR_TOKEN": "your-bear-api-token-here"
      }
    }
  }
}
```

## Available Tools

### Core Note Operations

- **bear_open_note**: Open a note by ID or title (returns full note data and metadata)
- **bear_create_note**: Create a new note with title, content, and tags (returns note ID and title)
- **bear_add_text**: Add text to existing notes (append, prepend, replace)

### Search & Discovery

- **bear_search**: Search notes by term and/or tag (returns complete search results with metadata)
- **bear_get_tags**: Retrieve all available tags (returns full tags array)
- **bear_open_tag**: Open notes with specific tag(s) (returns notes list with details)

### Organization

- **bear_trash_note**: Move notes to trash
- **bear_archive_note**: Archive notes
- **bear_get_untagged**: Get notes without tags (returns complete untagged notes list)
- **bear_get_todo**: Get notes marked as todos (returns todo notes with metadata)
- **bear_get_today**: Get today's notes (returns today's notes with details)

### Tag Management

- **bear_rename_tag**: Rename existing tags
- **bear_delete_tag**: Delete tags

### Web Integration

- **bear_grab_url**: Create notes from web page content (returns created note ID and title)

## Security Notes

- The server uses macOS `open` command to execute Bear URLs
- API tokens should be kept secure and not shared
- Some operations require Bear to be unlocked (not in locked state)
- Encrypted notes cannot be accessed via the API

## Development

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Enhanced Callback Integration

This server leverages Bear's x-success callback mechanism to provide comprehensive data retrieval:

- **Real-time Data**: Most operations return actual Bear data instead of generic success messages
- **Complete Results**: Search operations return full note arrays with metadata
- **Immediate Access**: Created notes return their IDs for follow-up operations
- **Rich Metadata**: Notes include titles, identifiers, tags, dates, and content
- **Silent Operation**: Auto-closing HTML response minimizes browser window interference
- **Instant Close**: Multiple JavaScript methods ensure browser windows close immediately

### Callback-Enhanced Tools

The following tools use advanced callback integration for enhanced data retrieval:
- `bear_open_note`, `bear_create_note`, `bear_search`, `bear_get_tags`
- `bear_open_tag`, `bear_get_untagged`, `bear_get_todo`, `bear_get_today`, `bear_grab_url`

### Technical Implementation

**Auto-Close HTTP Response**: Uses standard `http://localhost:port/callback` URLs but returns HTML with multiple browser-closing mechanisms:
- Immediate `window.close()` JavaScript execution
- Meta refresh redirect to `about:blank`
- Hidden body styling to prevent content flash
- Cache-control headers to prevent browser caching

**Browser Window Minimization**: While a browser window may briefly appear, it closes automatically within milliseconds, providing near-silent operation.

## Limitations

- macOS only (Bear App limitation)
- Some operations require user interaction with Bear
- Callback operations have 10-second timeout limit (with automatic fallback)
- File attachments require base64 encoding
- Bear must be unlocked for encrypted note access
- Brief browser window flash may occur (auto-closes within milliseconds)

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions welcome! Please ensure:
- TypeScript compilation passes (`npm run build`)
- Bear URL schemes are correctly implemented
- Callback integration works properly
- Error handling is comprehensive
- Documentation is updated
- Test with `npm run test` (requires Bear App for full functionality)

## Links

- [Bear App](https://bear.app)
- [Bear X-callback-URL Documentation](https://bear.app/faq/x-callback-url-scheme-documentation/)
- [Model Context Protocol](https://modelcontextprotocol.io/)