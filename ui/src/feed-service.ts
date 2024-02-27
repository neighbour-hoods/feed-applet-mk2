import { ActionHash, Record, AppAgentClient, CallZomeRequest, CellId, RoleName } from '@holochain/client';
import { Post } from './feed/posts/types';
import { EntryRecord } from '@holochain-open-dev/utils';

export class FeedService {
  constructor(public client: AppAgentClient, public cellId: CellId, public roleName: RoleName, public zomeName = 'posts') {}

  /** Post */

  async createPost(post: Post): Promise<EntryRecord<Post>> {
    const record: Record = await this.callZome('create_post', post);
    return new EntryRecord(record);
  }

  async fetchPost(postHash: ActionHash): Promise<EntryRecord<Post> | undefined> {
    const record: Record = await this.callZome('get_post', postHash);
    return record ? new EntryRecord(record) : undefined;
  }

  deletePost(originalPostHash: ActionHash): Promise<ActionHash> {
    return this.callZome('delete_post', originalPostHash);
  }

  async updatePost(originalPostHash: ActionHash, previousPostHash: ActionHash, updatedPost: Post): Promise<EntryRecord<Post>> {
    const record: Record = await this.callZome('update_post', {
      original_post_hash: originalPostHash,
      previous_post_hash: previousPostHash,
      updated_post: updatedPost
    });
    return new EntryRecord(record);
  }

  /** All Posts */

  async fetchAllPosts(): Promise<Array<EntryRecord<Post>>> {
    const records: Record[] = await this.callZome('get_all_posts', null);
    return records.map(r => new EntryRecord(r));
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
