##Deal Network
- "Production" branch is the version live on the mysite here: http://www.myajc.com/deal-network/
- Ran 10/26/13 with <a href="http://www.myajc.com/news/news/ethics-laws-vex-watchdogs-state-officials-alike/nbYgB/">this</a> story

- Uses <a href="https://github.com/mbostock/d3/wiki/Force-Layout" target="_blank">D3 force layout</a>

####Production branch
- Published version, does not include the editing functionality
- Assumes JSON data generated using the editor version (master branch)
- Production version releases all fixed bilink nodes on first call of `drag` event, to prevent awkward curves since without the editor controls they can't be manually changed

####TODO
- [ ] Display directional arrows? Had an issue with this because of the node scaling by weight
- [ ] Add ability to set position of labels
- [ ] Different colored nodes to signify person vs non-person.
- [ ] Highlight the relevant links when hovering over legend items

