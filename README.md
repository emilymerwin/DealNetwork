##Deal Network
- "Production" branch is the version live on the mysite here: http://www.myajc.com/deal-network/
- Ran 10/26/13 with <a href="http://www.myajc.com/news/news/ethics-laws-vex-watchdogs-state-officials-alike/nbYgB/">this</a> story

##How it works
- Uses <a href="https://github.com/mbostock/d3/wiki/Force-Layout" target="_blank">D3 force layout</a>
- D3Network_CSVtoJSON.py takes CSV from a spreadsheet formatted like <a href="https://docs.google.com/spreadsheets/d/1u3v6rQTXINnn_C9X72pmyH-M_6dGXXGKKaDCNk9V3vY/edit?usp=sharing">this</a> and spits out JSON formatted how the D3 force directed layout wants it
- Default view hides labels for nodes with fewer than three connections (a few appear as though they fit that criteria but actually have multiple links to the same people that you can't see)
- "Edit mode" highlights fixed nodes in red and labels all nodes
- "Edit mode" will display the curve anchors as little blue dots
- "Save Layout" will print out the new JSON with the current positioning of the nodes
- Checks the JSON for the `bilinks` array, and if it's not there it creates one. If it is there, it uses the node index references to create copies of the nodes, so we can use the saved intermediate node locations to form the curves

####Production branch
- Published version, does not include the editing functionality

####Curvy links vs. straight Links:
- Because we are using a modified copy of the original JSON `links` array, `.source` and `.target`, which were modified on the (origin) <a href="https://github.com/emilymerwinajc/DealNetwork/tree/StraightLines">StraightLines branch</a>, are not modified here - they contain only their indexes, rather than a copy of the actual index node. This means we can access the indexes directly (`d.source` rather than `d.source.index`), but we will also need to go lookup those indexes in the original `links` array to access properties such as `.name` and `.connection`.

####TODO
- [ ] Option to add mug shots
- [ ] Clip whitespace from persons in parser
- [ ] Display directional arrows? Had an issue with this because of the node scaling by weight
- [ ] Add ability to set position of labels
- [ ] Different colored nodes to signify person vs non-person.
- [ ] Highlight the relevant links when hovering over legend items

