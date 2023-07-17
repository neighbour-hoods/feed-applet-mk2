import { derived, get, Writable, writable } from 'svelte/store';
import { AgentPubKey, AgentPubKeyB64, AppAgentClient, Record, AppSignal, AppWebsocket, CellId, encodeHashToBase64, EntryHash, ActionHash, DnaHash, RoleName } from '@holochain/client';
import { FeedService } from './feed-service';
import { PostsSignal, Post, WrappedEntry, EntryTypes } from './feed/posts/types';
import { lazyLoadAndPoll, AsyncReadable } from "@holochain-open-dev/stores";
import { EntryRecord, LazyHoloHashMap } from "@holochain-open-dev/utils";

export class FeedStore {
  service: FeedService;

  /** Post */

  posts = new LazyHoloHashMap((postHash: ActionHash) =>
    lazyLoadAndPoll(async () => this.service.fetchPost(postHash), 4000)
  );
  
  /** All Posts */

  allPosts = lazyLoadAndPoll(async () => {
    const records = await this.service.fetchAllPosts();
    console.log('alllPosts records :>> ', records);
    return records.map(r => r.actionHash);
  }, 4000);

  #postData: Writable<Array<EntryRecord<Post>>> = writable([]);

  signaledHashes: Array<ActionHash> = [];

  public myAgentPubKey: AgentPubKeyB64;
  // get myAgentPubKey(): AgentPubKeyB64 {
  //   return encodeHashToBase64(this.FeedCell.cell_id[1]);
  // }

  constructor(
    protected client: AppWebsocket,
    protected cellId: CellId,
    roleName: RoleName,
  ) {
    client.on("signal", (signal: AppSignal) => {
      console.log("received signal: ", signal)
      if (signal.zome_name !== 'posts') return; 
      const payload = signal.payload as PostsSignal;
      if (payload.type !== 'EntryCreated') return;
      if (payload.app_entry.type !== 'Post') return;
      this.signaledHashes = [payload.action.hashed.hash, ...this.signaledHashes];
    });
    this.service = new FeedService(
      client,
      cellId,
      roleName
    );
    this.myAgentPubKey = encodeHashToBase64(cellId[1]);
  }

  async fetchAllPosts(): Promise<Array<EntryRecord<Post>>> {
    const fetchedPosts = await this.service.fetchAllPosts();
    console.log('fetchedPosts :>> ', fetchedPosts);
    this.#postData.update(posts => ({
      ...posts,
      ...fetchedPosts,
    }));
    return get(this.#postData);
  }

  allPostEntryHashes() {
    return derived(this.#postData, posts => {
      let allPostsEhs: EntryHash[] = []
      console.log('posts :>> ', posts);
      posts.map(post => {
        allPostsEhs.push(post.record.signed_action.hashed.hash)
      })
      return allPostsEhs
    })
  }

}
