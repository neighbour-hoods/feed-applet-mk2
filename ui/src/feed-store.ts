import { derived, get, Writable, writable } from 'svelte/store';
import { AgentPubKey, AgentPubKeyB64, AppAgentClient, Record, AppSignal, AppWebsocket, CellId, encodeHashToBase64, EntryHash, ActionHash, DnaHash, RoleName } from '@holochain/client';
import { FeedService } from './feed-service';
import { PostsSignal, Post, WrappedEntry, EntryTypes } from './feed/types';
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
    const records = await this.fetchAllPosts();
    console.log('polling all post records :>> ', records);
    return records.map(r => r.entryHash);
  }, 4000);

  allPostsForAssessment = lazyLoadAndPoll(async () => {
    await this.fetchAllPosts();
    const tuples =get(await this.allPostEntryActionHashTuples());
    // console.log('polling all post eh/ah :>> ', tuples);
    return tuples
  }, 1000);

  #postData: Writable<Array<EntryRecord<Post>>> = writable([]);

  signaledHashes: Array<ActionHash> = [];

  public myAgentPubKey: AgentPubKeyB64;
  // get myAgentPubKey(): AgentPubKeyB64 {
  //   return encodeHashToBase64(this.FeedCell.cell_id[1]);
  // }

  constructor(
    protected client: AppAgentClient,
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
    this.#postData.update(posts => ([
      ...fetchedPosts,
    ]));
    return get(this.#postData);
  }

  allPostEntryActionHashTuples() {
    return derived(this.#postData, posts => {
      let allPostsEhAhs: [EntryHash, ActionHash][] = []
      posts.map(post => {
        allPostsEhAhs.push([post.entryHash, post.actionHash])
      })
      return allPostsEhAhs
    })
  }
  allPostEntryHashes() {
    return derived(this.#postData, posts => {
      let allPostsEhs: EntryHash[] = []
      posts.map(post => {
        allPostsEhs.push(post.entryHash)
      })
      console.log('allPostsEhs :>> ', allPostsEhs);
      return allPostsEhs
    })
  }

  entryActionHashTuplesFromEntryHashes(entryHashes: EntryHash[]) {
    if(!entryHashes || !entryHashes.length) return;
    const serializedEntryHashes = entryHashes.map(entryHash => encodeHashToBase64(entryHash));
    return derived(this.allPostEntryActionHashTuples(), recordTuples => {
      return recordTuples.filter(tuple => serializedEntryHashes.includes(encodeHashToBase64(tuple[0])))
    })
  }

  async createPost(input: Post): Promise<EntryRecord<Post>> {
    const postRecord = await this.service.createPost(input);
    this.#postData.update(posts => [...posts, postRecord]);
    return postRecord as EntryRecord<Post>;
  }
  
  async updatePost(input: UpdatePostInput): Promise<EntryRecord<Post>> {
    const postRecord = await this.service.updatePost(input.original_post_hash, input.previous_post_hash, input.updated_post);
    this.#postData.update(posts => [...posts, postRecord]);
    return postRecord as EntryRecord<Post>;
  }
  
}
interface UpdatePostInput {
      original_post_hash: ActionHash
      previous_post_hash: ActionHash,
      updated_post: Post,
}
