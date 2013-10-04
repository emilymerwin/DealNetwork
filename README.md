##Deal Network

- Uses D3 force directed layout
- D3Network_CSVtoJSON.py takes CSV from a spreadsheet formatted like <a href="https://docs.google.com/spreadsheet/ccc?key=0AhCTN8bJ6kLCdHBBNlVtU0lRTm1wVmlzX1lzV0tnV3c&usp=sharing">this</a> and spits out JSON formatted how the D3 force directed layout wants it
- Default view hides labels for nodes with fewer than three connections (a few appear as though they fit that criteria but actually have multiple links to the same people that you can't see)
-"Edit mode" displays highlights fixed nodes in red and labels all nodes
- "Save Layout" will print out the new JSON with the current positioning of the nodes - coordinates are being saved even if position is not fixed, not sure if that's something we do or don't need

###TODO
- [X] Tooltips only display names, because that is the only info attached to the circle DOM. Need to attach the other info so we can display it.
- [ ] Bound nodes to the container, even though we're probably getting rid of the un-attached floaty ones anyway
- [ ] Display directional arrows? Had an issue with this because of the node scaling by weight