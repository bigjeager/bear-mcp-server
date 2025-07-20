# Bear App MCP Server

A Model Context Protocol (MCP) server that provides integration with Bear App using its X-callback-URL scheme. This server enables AI assistants to interact with Bear notes, create new content, search, and manage tags.

## Features

- **Note Management**: Create, open, and modify notes
- **Text Operations**: Add, append, prepend, or replace text in existing notes
- **Search**: Search through notes and tags
- **Tag Management**: Get, open, rename, and delete tags
- **Organization**: Archive, trash, and organize notes
- **Web Content**: Grab content from URLs to create notes
- **Special Views**: Access Today, Todo, and Untagged note collections

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

- **bear_open_note**: Open a note by ID or title
- **bear_create_note**: Create a new note with title, content, and tags
- **bear_add_text**: Add text to existing notes (append, prepend, replace)

### Search & Discovery

- **bear_search**: Search notes by term and/or tag
- **bear_get_tags**: Retrieve all available tags
- **bear_open_tag**: Open notes with specific tag(s)

### Organization

- **bear_trash_note**: Move notes to trash
- **bear_archive_note**: Archive notes
- **bear_get_untagged**: Get notes without tags
- **bear_get_todo**: Get notes marked as todos
- **bear_get_today**: Get today's notes

### Tag Management

- **bear_rename_tag**: Rename existing tags
- **bear_delete_tag**: Delete tags

### Web Integration

- **bear_grab_url**: Create notes from web page content

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

## Limitations

- macOS only (Bear App limitation)
- Some operations require user interaction with Bear
- Response data is limited compared to direct API access
- File attachments require base64 encoding

## License

MIT License - feel free to modify and distribute

## Contributing

Contributions welcome! Please ensure:
- TypeScript compilation passes
- Bear URL schemes are correctly implemented
- Error handling is comprehensive
- Documentation is updated

## Links

- [Bear App](https://bear.app)
- [Bear X-callback-URL Documentation](https://bear.app/faq/x-callback-url-scheme-documentation/)
- [Model Context Protocol](https://modelcontextprotocol.io/)