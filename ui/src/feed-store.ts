import { derived, get, Writable, writable } from 'svelte/store';
import { AgentPubKey, AgentPubKeyB64, AppAgentClient, Record, AppSignal, AppWebsocket, CellId, encodeHashToBase64, EntryHash, ActionHash, DnaHash, RoleName } from '@holochain/client';
import { FeedService } from './feed-service';
import { PostsSignal, Post, WrappedEntry, EntryTypes } from './feed/posts/types';


export class FeedStore {
  service: FeedService;

  #postData: Writable<Array<Record>> = writable([]);

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

  allPosts() {
    return this.#postData;
  }

  async fetchAllPosts(): Promise<Array<Record>> {
    const fetchedPosts = await this.service.fetchAllPosts();
    this.#postData.update(posts => ([
      ...fetchedPosts,
    ]));
    return get(this.#postData);
  }

  allPostEntryHashes() {
    return derived(this.#postData, posts => {
      let allPostsEhs: EntryHash[] = []
      posts.map(post => {
        allPostsEhs.push((post.signed_action.hashed.content as {entry_hash: EntryHash}).entry_hash)
      })
      return allPostsEhs
    })
  }
  async createPost(input: Post): Promise<Record> {
    const postRecord = await this.service.createPost(input);
    this.#postData.update(posts => [...posts, postRecord]);
    return postRecord;
  }

}
