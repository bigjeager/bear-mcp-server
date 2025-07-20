#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface BearNote {
  title?: string;
  identifier?: string;
  tags?: string[];
  modificationDate?: string;
  creationDate?: string;
  pin?: boolean;
  note?: string;
  is_trashed?: boolean;
}

interface BearResponse {
  notes?: BearNote[];
  tags?: Array<{ name: string }>;
  note?: string;
  identifier?: string;
  title?: string;
  is_trashed?: boolean;
  modificationDate?: string;
  creationDate?: string;
}

class BearMCPServer {
  private server: Server;
  private token?: string;

  constructor() {
    this.server = new Server(
      {
        name: "bear-app-server",
        version: "1.0.0",
      }
    );

    this.setupToolHandlers();
  }

  private async executeURL(url: string): Promise<string> {
    try {
      const command = `open "${url}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        throw new Error(`Bear command failed: ${stderr}`);
      }
      
      return stdout;
    } catch (error) {
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to execute Bear URL: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  private buildBearURL(action: string, params: Record<string, string | boolean> = {}): string {
    const baseURL = `bear://x-callback-url/${action}`;
    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        queryParts.push(`${encodedKey}=${encodedValue}`);
      }
    }

    const queryString = queryParts.join('&');
    return queryString ? `${baseURL}?${queryString}` : baseURL;
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "bear_open_note",
            description: "Open a note in Bear by ID or title",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Note unique identifier"
                },
                title: {
                  type: "string",
                  description: "Note title"
                },
                header: {
                  type: "string",
                  description: "Header inside the note"
                },
                exclude_trashed: {
                  type: "boolean",
                  description: "Exclude trashed notes"
                },
                new_window: {
                  type: "boolean",
                  description: "Open in external window (macOS only)"
                },
                edit: {
                  type: "boolean",
                  description: "Place cursor in note editor"
                },
                selected: {
                  type: "string",
                  description: "Selected text in note"
                },
                pin: {
                  type: "boolean",
                  description: "Pin note to top of list"
                },
                float: {
                  type: "boolean",
                  description: "Float note window"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                },
                open_note: {
                  type: "boolean",
                  description: "Open note after command"
                },
                search: {
                  type: "string",
                  description: "Search term within note"
                }
              }
            }
          },
          {
            name: "bear_create_note",
            description: "Create a new note in Bear",
            inputSchema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Note title"
                },
                text: {
                  type: "string",
                  description: "Note content"
                },
                tags: {
                  type: "string",
                  description: "Comma-separated list of tags"
                },
                pin: {
                  type: "boolean",
                  description: "Pin note to top of list"
                },
                timestamp: {
                  type: "boolean",
                  description: "Prepend current date and time"
                },
                clipboard: {
                  type: "boolean",
                  description: "Get text from clipboard"
                },
                file: {
                  type: "string",
                  description: "File path to add to note"
                },
                filename: {
                  type: "string",
                  description: "Custom filename for attached file"
                },
                open_note: {
                  type: "boolean",
                  description: "Open note after creation"
                },
                new_window: {
                  type: "boolean",
                  description: "Open in new window"
                },
                float: {
                  type: "boolean",
                  description: "Float note window"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                },
                edit: {
                  type: "boolean",
                  description: "Place cursor in note editor"
                },
                type: {
                  type: "string",
                  description: "Note type"
                },
                url: {
                  type: "string",
                  description: "URL to include in note"
                }
              }
            }
          },
          {
            name: "bear_add_text",
            description: "Add text to an existing note",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Note unique identifier"
                },
                title: {
                  type: "string",
                  description: "Note title"
                },
                text: {
                  type: "string",
                  description: "Text to add"
                },
                mode: {
                  type: "string",
                  enum: ["append", "prepend", "replace_all", "replace"],
                  description: "How to add the text"
                },
                new_line: {
                  type: "boolean",
                  description: "Force text on new line when appending"
                },
                header: {
                  type: "string",
                  description: "Add text to specific header"
                },
                selected: {
                  type: "string",
                  description: "Selected text in note"
                },
                clipboard: {
                  type: "boolean",
                  description: "Get text from clipboard"
                },
                exclude_trashed: {
                  type: "boolean",
                  description: "Exclude trashed notes"
                },
                open_note: {
                  type: "boolean",
                  description: "Open note after adding text"
                },
                new_window: {
                  type: "boolean",
                  description: "Open in new window"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                },
                edit: {
                  type: "boolean",
                  description: "Place cursor in note editor"
                },
                timestamp: {
                  type: "boolean",
                  description: "Prepend current date and time"
                }
              },
              required: ["text"]
            }
          },
          {
            name: "bear_add_file",
            description: "Add a file to an existing note",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Note unique identifier"
                },
                title: {
                  type: "string",
                  description: "Note title"
                },
                selected: {
                  type: "string",
                  description: "Selected text in note"
                },
                file: {
                  type: "string",
                  description: "File path to add"
                },
                header: {
                  type: "string",
                  description: "Add file to specific header"
                },
                filename: {
                  type: "string",
                  description: "Custom filename for the file"
                },
                mode: {
                  type: "string",
                  enum: ["append", "prepend", "replace_all", "replace"],
                  description: "How to add the file"
                },
                open_note: {
                  type: "boolean",
                  description: "Open note after adding file"
                },
                new_window: {
                  type: "boolean",
                  description: "Open in new window"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                },
                edit: {
                  type: "boolean",
                  description: "Place cursor in note editor"
                }
              },
              required: ["file"]
            }
          },
          {
            name: "bear_search",
            description: "Search for notes in Bear",
            inputSchema: {
              type: "object",
              properties: {
                term: {
                  type: "string",
                  description: "Search term"
                },
                tag: {
                  type: "string",
                  description: "Tag to search within"
                },
                token: {
                  type: "string",
                  description: "Bear API token"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_get_tags",
            description: "Get all tags from Bear",
            inputSchema: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  description: "Bear API token (required)",
                  required: true
                }
              },
              required: ["token"]
            }
          },
          {
            name: "bear_open_tag",
            description: "Open notes with specific tag(s)",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Tag name or comma-separated list of tags"
                },
                token: {
                  type: "string",
                  description: "Bear API token"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              },
              required: ["name"]
            }
          },
          {
            name: "bear_trash_note",
            description: "Move a note to trash",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Note unique identifier"
                },
                search: {
                  type: "string",
                  description: "Search term to find notes to trash"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_archive_note",
            description: "Archive a note",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Note unique identifier"
                },
                search: {
                  type: "string",
                  description: "Search term to find notes to archive"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_get_untagged",
            description: "Get untagged notes",
            inputSchema: {
              type: "object",
              properties: {
                search: {
                  type: "string",
                  description: "Search term"
                },
                token: {
                  type: "string",
                  description: "Bear API token"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_get_todo",
            description: "Get todo notes",
            inputSchema: {
              type: "object",
              properties: {
                search: {
                  type: "string",
                  description: "Search term"
                },
                token: {
                  type: "string",
                  description: "Bear API token"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_get_today",
            description: "Get today's notes",
            inputSchema: {
              type: "object",
              properties: {
                search: {
                  type: "string",
                  description: "Search term"
                },
                token: {
                  type: "string",
                  description: "Bear API token"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_get_locked",
            description: "Get locked (encrypted) notes",
            inputSchema: {
              type: "object",
              properties: {
                search: {
                  type: "string",
                  description: "Search term"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              }
            }
          },
          {
            name: "bear_grab_url",
            description: "Create a note from web page content",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to grab content from"
                },
                tags: {
                  type: "string",
                  description: "Comma-separated list of tags"
                },
                pin: {
                  type: "boolean",
                  description: "Pin note to top of list"
                },
                wait: {
                  type: "boolean",
                  description: "Wait for content to load"
                }
              },
              required: ["url"]
            }
          },
          {
            name: "bear_rename_tag",
            description: "Rename an existing tag",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Current tag name"
                },
                new_name: {
                  type: "string",
                  description: "New tag name"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              },
              required: ["name", "new_name"]
            }
          },
          {
            name: "bear_delete_tag",
            description: "Delete an existing tag",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Tag name to delete"
                },
                show_window: {
                  type: "boolean",
                  description: "Show Bear window"
                }
              },
              required: ["name"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "bear_open_note":
            return await this.openNote(args);
          case "bear_create_note":
            return await this.createNote(args);
          case "bear_add_text":
            return await this.addText(args);
          case "bear_add_file":
            return await this.addFile(args);
          case "bear_search":
            return await this.search(args);
          case "bear_get_tags":
            return await this.getTags(args);
          case "bear_open_tag":
            return await this.openTag(args);
          case "bear_trash_note":
            return await this.trashNote(args);
          case "bear_archive_note":
            return await this.archiveNote(args);
          case "bear_get_untagged":
            return await this.getUntagged(args);
          case "bear_get_todo":
            return await this.getTodo(args);
          case "bear_get_today":
            return await this.getToday(args);
          case "bear_get_locked":
            return await this.getLocked(args);
          case "bear_grab_url":
            return await this.grabUrl(args);
          case "bear_rename_tag":
            return await this.renameTag(args);
          case "bear_delete_tag":
            return await this.deleteTag(args);
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async openNote(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.id) params.id = args.id;
    if (args.title) params.title = args.title;
    if (args.header) params.header = args.header;
    if (args.exclude_trashed) params.exclude_trashed = "yes";
    if (args.new_window) params.new_window = "yes";
    if (args.edit) params.edit = "yes";
    if (args.selected) params.selected = args.selected;
    if (args.pin) params.pin = "yes";
    if (args.float) params.float = "yes";
    if (args.show_window) params.show_window = "yes";
    if (args.open_note) params.open_note = "yes";
    if (args.search) params.search = args.search;

    const url = this.buildBearURL("open-note", params);
    const result = await this.executeURL(url);

    // Parse the result as JSON to get the note content
    try {
      const response: BearResponse = JSON.parse(result);
      return {
        content: [
          {
            type: "text",
            text: response.note || `Opened note in Bear${args.id ? ` with ID: ${args.id}` : args.title ? ` with title: ${args.title}` : ""}`
          }
        ]
      };
    } catch (error) {
      // If JSON parsing fails, return the raw result or fallback message
      return {
        content: [
          {
            type: "text",
            text: result || `Opened note in Bear${args.id ? ` with ID: ${args.id}` : args.title ? ` with title: ${args.title}` : ""}`
          }
        ]
      };
    }
  }

  private async createNote(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.title) params.title = args.title;
    if (args.text) params.text = args.text;
    if (args.tags) params.tags = args.tags;
    if (args.pin) params.pin = "yes";
    if (args.timestamp) params.timestamp = "yes";
    if (args.clipboard) params.clipboard = "yes";
    if (args.file) params.file = args.file;
    if (args.filename) params.filename = args.filename;
    if (args.open_note) params.open_note = "yes";
    if (args.new_window) params.new_window = "yes";
    if (args.float) params.float = "yes";
    if (args.show_window) params.show_window = "yes";
    if (args.edit) params.edit = "yes";
    if (args.type) params.type = args.type;
    if (args.url) params.url = args.url;

    const url = this.buildBearURL("create", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Created new note in Bear${args.title ? ` with title: ${args.title}` : ""}`
        }
      ]
    };
  }

  private async addText(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.id) params.id = args.id;
    if (args.title) params.title = args.title;
    if (args.text) params.text = args.text;
    if (args.mode) params.mode = args.mode;
    if (args.new_line) params.new_line = "yes";
    if (args.header) params.header = args.header;
    if (args.selected) params.selected = args.selected;
    if (args.clipboard) params.clipboard = "yes";
    if (args.exclude_trashed) params.exclude_trashed = "yes";
    if (args.open_note) params.open_note = "yes";
    if (args.new_window) params.new_window = "yes";
    if (args.show_window) params.show_window = "yes";
    if (args.edit) params.edit = "yes";
    if (args.timestamp) params.timestamp = "yes";

    const url = this.buildBearURL("add-text", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Added text to note in Bear${args.mode ? ` using mode: ${args.mode}` : ""}`
        }
      ]
    };
  }

  private async search(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.term) params.term = args.term;
    if (args.tag) params.tag = args.tag;
    if (args.token) params.token = args.token;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("search", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Searched Bear for: ${args.term || "all notes"}${args.tag ? ` in tag: ${args.tag}` : ""}`
        }
      ]
    };
  }

  private async getTags(args: any) {
    if (!args.token) {
      throw new McpError(ErrorCode.InvalidParams, "Token is required for getTags");
    }

    const params = { token: args.token };
    const url = this.buildBearURL("tags", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: "Retrieved all tags from Bear"
        }
      ]
    };
  }

  private async openTag(args: any) {
    const params: Record<string, string | boolean> = { name: args.name };
    
    if (args.token) params.token = args.token;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("open-tag", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Opened notes with tag: ${args.name}`
        }
      ]
    };
  }

  private async trashNote(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.id) params.id = args.id;
    if (args.search) params.search = args.search;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("trash", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Moved note(s) to trash${args.id ? ` with ID: ${args.id}` : args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async archiveNote(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.id) params.id = args.id;
    if (args.search) params.search = args.search;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("archive", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Archived note(s)${args.id ? ` with ID: ${args.id}` : args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async getUntagged(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.search) params.search = args.search;
    if (args.token) params.token = args.token;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("untagged", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Retrieved untagged notes${args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async getTodo(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.search) params.search = args.search;
    if (args.token) params.token = args.token;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("todo", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Retrieved todo notes${args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async getToday(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.search) params.search = args.search;
    if (args.token) params.token = args.token;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("today", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Retrieved today's notes${args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async getLocked(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.search) params.search = args.search;
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("locked", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Retrieved locked notes${args.search ? ` matching: ${args.search}` : ""}`
        }
      ]
    };
  }

  private async addFile(args: any) {
    const params: Record<string, string | boolean> = {};
    
    if (args.id) params.id = args.id;
    if (args.title) params.title = args.title;
    if (args.selected) params.selected = args.selected;
    if (args.file) params.file = args.file;
    if (args.header) params.header = args.header;
    if (args.filename) params.filename = args.filename;
    if (args.mode) params.mode = args.mode;
    if (args.open_note) params.open_note = "yes";
    if (args.new_window) params.new_window = "yes";
    if (args.show_window) params.show_window = "yes";
    if (args.edit) params.edit = "yes";

    const url = this.buildBearURL("add-file", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Added file to note in Bear${args.filename ? ` with filename: ${args.filename}` : ""}`
        }
      ]
    };
  }

  private async grabUrl(args: any) {
    const params: Record<string, string | boolean> = { url: args.url };
    
    if (args.tags) params.tags = args.tags;
    if (args.pin) params.pin = "yes";
    if (args.wait) params.wait = "yes";

    const url = this.buildBearURL("grab-url", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Created note from URL: ${args.url}`
        }
      ]
    };
  }

  private async renameTag(args: any) {
    const params: Record<string, string | boolean> = {
      name: args.name,
      new_name: args.new_name
    };
    
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("rename-tag", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Renamed tag from "${args.name}" to "${args.new_name}"`
        }
      ]
    };
  }

  private async deleteTag(args: any) {
    const params: Record<string, string | boolean> = { name: args.name };
    
    if (args.show_window) params.show_window = "yes";

    const url = this.buildBearURL("delete-tag", params);
    await this.executeURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Deleted tag: ${args.name}`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Bear MCP server running on stdio");
  }
}

const server = new BearMCPServer();
server.run().catch(console.error);