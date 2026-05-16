import json
from graphify.build import build_from_json
from graphify.export import to_json
from networkx.readwrite import json_graph
from pathlib import Path

def merge_incremental():
    # Load existing graph
    existing_path = Path('graphify-out/graph.json')
    if not existing_path.exists():
        print("Error: graphify-out/graph.json not found")
        return
        
    existing_data = json.loads(existing_path.read_text())
    G_existing = json_graph.node_link_graph(existing_data, edges='links')
    
    # Load new extraction
    extract_path = Path('.graphify_extract.json')
    if not extract_path.exists():
        print("Error: .graphify_extract.json not found")
        return
        
    new_extraction = json.loads(extract_path.read_text())
    G_new = build_from_json(new_extraction)
    
    # Merge: new nodes/edges into existing graph
    G_existing.update(G_new)
    
    # Save back to graphify-out/graph.json
    # We'll use Step 4 logic for this in a bit, but for now we just merge in memory
    # Actually, Step 4 rebuilds everything from the extraction, so let's follow that.
    
if __name__ == "__main__":
    # The instructions say: "run Steps 4–8 on the merged graph as normal."
    # But Step 4 says: "extraction = json.loads(Path('.graphify_extract.json').read_text())"
    # and then "G = build_from_json(extraction)"
    # This would rebuild the whole graph from scratch if .graphify_extract.json only contains new nodes.
    # For --update, I should probably merge the extractions first.
    pass
