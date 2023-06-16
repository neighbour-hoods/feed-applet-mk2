import { ActionHash, AgentPubKey, Record, AppAgentCallZomeRequest, Entry, AppAgentClient, AppWebsocket, CallZomeRequest, CellId, RoleName } from '@holochain/client';
import { Post, WrappedEntry, EntryTypes } from './feed/posts/types';

export class FeedService {
  constructor(public client: AppWebsocket, public cellId: CellId, public roleName: RoleName, public zomeName = 'Feed') {}

  async createPost(input: Post): Promise<null> {
    return this.callZome('create_post', input);
  }

  async fetchAllPosts(): Promise<Array<Record>> {
    return this.callZome('get_all_posts', null);
  }
  
  private callZome(fn_name: string, payload: any) {
    const req: CallZomeRequest = {
      cell_id: this.cellId,
      zome_name: this.zomeName,
      fn_name,
      payload,
      provenance: this.cellId[1],
    }
    return this.client.callZome(req);
  }
}
