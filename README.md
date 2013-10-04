##Deal Network

- Uses D3 force directed layout
- D3Network_CSVtoJSON.py takes CSV from a spreadsheet formatted like <a href="https://docs.google.com/spreadsheet/ccc?key=0AhCTN8bJ6kLCdHBBNlVtU0lRTm1wVmlzX1lzV0tnV3c&usp=sharing">this</a> and spits out JSON formatted how the D3 force directed layout wants it
- Default view hides labels for nodes with fewer than three connections (a few appear as though they fit that criteria but actually have multiple links to the same people that you can't see)
- "Edit mode" highlights fixed nodes in red and labels all nodes
- "Save Layout" will print out the new JSON with the current positioning of the nodes

###TODO
- [X] Tooltips only display names, because that is the only info attached to the circle DOM. Need to attach the other info so we can display it.
- [ ] Add edit-mode option to release all fixed elements
- [ ] Display directional arrows? Had an issue with this because of the node scaling by weight
- [ ] jQuery, jQuery UI and jQuery UI css are being used for the tooltips and the edit mode buttons - might want to either create own or download a custom package to reduce unnecessary load

