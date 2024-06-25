import { CallableCell } from '@holochain/tryorama';
import { NewEntryAction, ActionHash, Record, AppBundleSource, fakeActionHash, fakeAgentPubKey, fakeEntryHash, fakeDnaHash } from '@holochain/client';

export async function samplePost(cell: CallableCell, partialPost = {}) {
    return {
        ...{
	  title: "Check it out!",
	  text_content: "Just harvested my first batch of tomatoes! So excited to cook with them tonight 🍅😋",
	  image_content: "PHN2ZyB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHZpZXdCb3g9IjAgMCA1NSA1NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjU1IiBoZWlnaHQ9IjU1IiByeD0iMjcuNSIgZmlsbD0iIzI1MUYyOCIvPgo8cmVjdCB3aWR0aD0iNTUiIGhlaWdodD0iNTUiIHJ4PSIyNy41IiBmaWxsPSIjMzQyRDM3Ii8+CjxwYXRoIGQ9Ik0yNSAxMi41QzI1IDEyLjUgMjUgMTAgMjcuNSAxMEMzMCAxMCAzMCAxMi41IDMwIDEyLjVWMjIuNUMzMCAyMi41IDMwIDI1IDMyLjUgMjVDMzUgMjUgNDIuNSAyNSA0Mi41IDI1QzQyLjUgMjUgNDUgMjUgNDUgMjcuNUM0NSAzMCA0Mi41IDMwIDQyLjUgMzBIMjcuNUMyNy41IDMwIDI1IDMwIDI1IDI3LjVDMjUgMjUgMjUgMTIuNSAyNSAxMi41WiIgZmlsbD0idXJsKCNwYWludDBfcmFkaWFsXzg3MF83NjQwKSIvPgo8cGF0aCBkPSJNMzAgNDIuNUMzMCA0Mi41IDMwIDQ1IDI3LjUgNDVDMjUgNDUgMjUgNDIuNSAyNSA0Mi41VjMyLjVDMjUgMzIuNSAyNSAzMCAyMi41IDMwQzIwIDMwIDEyLjUgMzAgMTIuNSAzMEMxMi41IDMwIDEwIDMwIDEwIDI3LjVDMTAgMjUgMTIuNSAyNSAxMi41IDI1SDI3LjVDMjcuNSAyNSAzMCAyNSAzMCAyNy41QzMwIDMwIDMwIDQyLjUgMzAgNDIuNVoiIGZpbGw9InVybCgjcGFpbnQxX3JhZGlhbF84NzBfNzY0MCkiLz4KPGRlZnM+CjxyYWRpYWxHcmFkaWVudCBpZD0icGFpbnQwX3JhZGlhbF84NzBfNzY0MCIgY3g9IjAiIGN5PSIwIiByPSIxIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgZ3JhZGllbnRUcmFuc2Zvcm09InRyYW5zbGF0ZSgyOC4wMDIyIDI3LjE0MzEpIHJvdGF0ZSgtNS4yNzY1OSkgc2NhbGUoNDMuNzk4NiAyNS44MDA0KSI+CjxzdG9wIHN0b3AtY29sb3I9IiNBMTc5RkYiLz4KPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjQTE3OUZGIiBzdG9wLW9wYWNpdHk9IjAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPHJhZGlhbEdyYWRpZW50IGlkPSJwYWludDFfcmFkaWFsXzg3MF83NjQwIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDEzLjU3MDQgMjcuNDQ4Mikgcm90YXRlKDIyLjQzMzQpIHNjYWxlKDM2Ljg3NzIgMjMuMzA3OSkiPgo8c3RvcCBzdG9wLWNvbG9yPSIjQTE3OUZGIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ExNzlGRiIgc3RvcC1vcGFjaXR5PSIwIi8+CjwvcmFkaWFsR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+Cg==",
	  hash_tags: ["urbangardening", "homegrown", "hobbies"],
        },
        ...partialPost
    };
}

export async function createPost(cell: CallableCell, post = undefined): Promise<Record> {
    return cell.callZome({
      zome_name: "posts",
      fn_name: "create_post",
      payload: post || await samplePost(cell),
    });
}

