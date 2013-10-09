##Deal Network

- Uses D3 force directed layout
- D3Network_CSVtoJSON.py takes CSV from a spreadsheet formatted like <a href="https://docs.google.com/spreadsheet/ccc?key=0AhCTN8bJ6kLCdHBBNlVtU0lRTm1wVmlzX1lzV0tnV3c&usp=sharing">this</a> and spits out JSON formatted how the D3 force directed layout wants it
- Default view hides labels for nodes with fewer than three connections (a few appear as though they fit that criteria but actually have multiple links to the same people that you can't see)
- "Edit mode" highlights fixed nodes in red and labels all nodes
- "Save Layout" will print out the new JSON with the current positioning of the nodes

###CurvyLinks branch:
- Because we are using a modified copy of the original JSON `links` array, `.source` and `.target`, which were modified before, are not modified here - they contain only their indexes, rather than a copy of the actual index node. This means we can access the indexes directly (`d.source` rather than `d.source.index`), but we will also need to go lookup those indexes in the original `links` array to access properties such as `.name` and `.connection`.
- "Edit mode" will display the curve anchors as little blue dots - you can not currently save the position of these

###TODO
- [ ] Save position of Bezier nodes
- [X] Tooltips only display names, because that is the only info attached to the circle DOM. Need to attach the other info so we can display it.
- [X] Add edit-mode option to release all fixed elements
- [ ] Display directional arrows? Had an issue with this because of the node scaling by weight
- [X] don't really need jQuery, get rid of it
- [ ] Add ability to set position of labels
