use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn get_all_posts(_: ()) -> ExternResult<Vec<Record>> {
    let path = Path::from("all_posts");
    let links = get_links(path.path_entry_hash()?, LinkTypes::AllPosts, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| {
            let hash = AnyDhtHash::try_from(link.target.clone()).map_err(|_| {
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Failed to convert base_address to ActionHash"))
                )
            }).unwrap();
            return GetInput::new(
            hash,
            GetOptions::default(),
        )})
        .collect();
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    Ok(records)
}
