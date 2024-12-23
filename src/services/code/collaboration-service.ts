import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';

export class CollaborationService {
  private doc: Y.Doc;
  private provider: WebsocketProvider;
  private sessions: Map<string, Y.Text> = new Map();

  constructor() {
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider(
      'wss://your-collaboration-server.com',
      'code-playground',
      this.doc
    );
  }

  async createSession(id: string): Promise<void> {
    const yText = this.doc.getText(id);
    this.sessions.set(id, yText);
  }

  async joinSession(id: string): Promise<Y.Text | undefined> {
    return this.sessions.get(id);
  }

  getExtensions(id: string) {
    const yText = this.sessions.get(id);
    if (!yText) return [];
    
    return [
      yCollab(yText, this.provider.awareness),
    ];
  }

  destroy() {
    this.provider.destroy();
    this.doc.destroy();
  }
}