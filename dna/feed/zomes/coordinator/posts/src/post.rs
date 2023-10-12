use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn create_post(post: Post) -> ExternResult<Record> {
    let post_hash = create_entry(&EntryTypes::Post(post.clone()))?;
    let record = get(post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Post"))
            ),
        )?;
    let path = Path::from("all_posts");
    create_link(path.path_entry_hash()?, post_hash.clone(), LinkTypes::AllPosts, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_post(original_post_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(original_post_hash.clone(), LinkTypes::PostUpdates, None)?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_post_hash = match latest_link {
        Some(link) => ActionHash::from(link.target.clone()),
        None => original_post_hash.clone(),
    };
    get(latest_post_hash, GetOptions::default())
}
#[hdk_extern]
pub fn get_latest_post_with_eh(entry_hash: EntryHash) -> ExternResult<Option<Post>> {
    match get_details(entry_hash.clone(), GetOptions::default())? {
        Some(Details::Record(details)) => {
            match details.updates.len() {
                // pass out the action associated with this entry
                0 => Ok(Some(
                    entry_from_record(details.record)?
                )),
                _ => {
                    let mut sortlist = details.updates.to_vec();
                    // unix timestamp should work for sorting
                    sortlist.sort_by_key(|update| update.action().timestamp().as_millis());
                    // sorts in ascending order, so take the last record
                    let last = sortlist.last().unwrap().to_owned();
                    let hash = last.action_address();
                    match get(hash.clone(), GetOptions::default())? {
                        Some(record) => {
                            Ok(Some(entry_from_record(record)?))
                        }
                        None => Ok(None),
                    }
                }
            }
        }
        Some(Details::Entry(details)) => {
            match details.updates.len() {
                0 => {
                    let entry: Entry = details.entry;
                    let task = entry.as_app_entry().map(|entry| 
                        Post::try_from(SerializedBytes::from(entry.to_owned())).map_err(|err| wasm_error!(WasmErrorInner::Guest(err.into()))))
                            .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                                "Malformed post"
                            ))))??;
                    Ok(Some(task))
                },
                _ => {
                    let mut sortlist = details.updates.to_vec();
                    // unix timestamp should work for sorting
                    sortlist.sort_by_key(|update| update.action().timestamp().as_millis());
                    // sorts in ascending order, so take the last record
                    let last = sortlist.last().unwrap().to_owned();
                    let hash = last.action_address();
                    match get(hash.clone(), GetOptions::default())? {
                        Some(record) => {
                            Ok(Some(entry_from_record(record)?))
                        }
                        None => Ok(None),
                    }
                }
            }
        }
        _ => Ok(None),
    }
}

pub fn entry_from_record<T: TryFrom<SerializedBytes, Error = SerializedBytesError>>(record: Record) -> ExternResult<T> {
    Ok(record
        .entry()
        .to_app_option()
        .map_err(|err| wasm_error!(WasmErrorInner::from(err)))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Malformed post"
        ))))?)
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePostInput {
    pub original_post_hash: ActionHash,
    pub previous_post_hash: ActionHash,
    pub updated_post: Post,
}
#[hdk_extern]
pub fn update_post(input: UpdatePostInput) -> ExternResult<Record> {
    let updated_post_hash = update_entry(
        input.previous_post_hash.clone(),
        &input.updated_post,
    )?;
    create_link(
        input.original_post_hash.clone(),
        updated_post_hash.clone(),
        LinkTypes::PostUpdates,
        (),
    )?;
    let record = get(updated_post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated Post"))
            ),
        )?;
    Ok(record)
}
#[hdk_extern]
pub fn delete_post(original_post_hash: ActionHash) -> ExternResult<ActionHash> {
    delete_entry(original_post_hash)
}
