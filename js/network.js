var nodes = {};
d3.json("data/network.json", function(error, graph) {
/*	force
		.nodes(graph.nodes)
		.links(graph.links)
		.on("tick", tick)
		.start();*/
	//	links = graph
	var w = 960,
	    h = 960,
		r = d3.scale.sqrt().domain([0, 20]).range([0, 20]);
	
	var force = d3.layout.force()
	    .nodes(graph.nodes)
	    .links(graph.links)
	    .size([w, h])
	    .linkDistance(60)
	    .charge(-300)
	    .on("tick", tick)
	    .start();

	var svg = d3.select("body").append("svg:svg")
	    .attr("width", w)
	    .attr("height", h);

	var drag = force.drag()
		.on("dragstart", dragstart);
		
	function dragstart(d) {
		d.fixed = true;
		d3.select(this).classed("fixed", true);
	}

	// build the arrow.
	svg.append("svg:defs").selectAll("marker")
	    .data(["end"])      // Different link/path types can be defined here
	  .enter().append("svg:marker")    // This section adds in the arrows
	    .attr("id", String)
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 15)
	    //.attr("refY", -1.5) //only need this is if you have curved lines
	    .attr("markerWidth", 6)
	    .attr("markerHeight", 6)
	    .attr("orient", "auto")
	  .append("svg:path")
	    .attr("d", "M0,-5L10,0L0,5");

	var path = svg.append("svg:g").selectAll("path")
	    .data(force.links())
	  .enter().append("svg:path")
	    .attr("class", function(d) { return "link " + d.connection; })
	    //.attr("marker-end", function(d) { return "url(#" + d.connection + ")"; });
		.attr("marker-end", "url(#end)");

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(force.nodes())
	  .enter().append("svg:circle")
		.attr("r", function(d) { return r(d.weight) || 5; })
		.on("mouseover", mouseover)
	    .on("mouseout", mouseout)
	    .call(force.drag);

	var text = svg.append("svg:g").selectAll("g")
	    .data(force.nodes().filter(function(d) {return d.weight >=3;}))
	  .enter().append("svg:g");

	// A copy of the text with a thick white stroke for legibility.
	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .attr("class", "shadow")
	    .text(function(d) { return d.name; });

	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .text(function(d) { return d.name; });

	// Use elliptical arc path segments to doubly-encode directionality.
	function tick() {
	  path.attr("d", function(d) {
	    var dx = d.target.x - d.source.x,
	        dy = d.target.y - d.source.y,
	        //dr = Math.sqrt(dx * dx + dy * dy); //this is for curved lines
			dr = 0;
	    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
	  });

	  circle.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });

	  text.attr("transform", function(d) {
	    return "translate(" + d.x + "," + d.y + ")";
	  });
	}
	
	function mouseover() {
		d3.select(this).transition()
			.duration(5)
			.style("fill", "#636363");
	}

	function mouseout() {
		d3.select(this).transition()
			.duration(750)
			.style("fill", "#CCCCCC");
	}

	$(document).tooltip({
		items: $("circle"),
		position: { my: "right+15 bottom" },
		content: function(){
			var data = this.__data__; //this is not the right way to access the data, fix it
			var tip = data.name; //this is the only data currently stored on the circle object - we need access to the links and notes as well
			this.tip = tip;//store it so we don't have to parse all that again
			return tip;
		}
	});
})
// Compute the distinct nodes from the links.
/*links.forEach(function(link) {
  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
});*/
