(function () {
d3.json("data/network.json", function(error, graph) {
	var w = 700, h = 500, r = d3.scale.sqrt().domain([0, 20]).range([0, 20]);
	var force = d3.layout.force()
	    .nodes(graph.nodes)
	    .links(graph.links)
	    .size([w, h])
	    .linkDistance(20)
	    .charge(-200)
	    .on("tick", tick)
	    .start();

	var svg = d3.select("#network").append("svg:svg")
	    .attr("width", w)
	    .attr("height", h);

	var drag = force.drag()
		.on("dragstart", dragstart);

	function dragstart(d) {
		d.fixed = true;
		d3.select(this).classed("fixed", true);
	}

	var tooltip = d3.select("#tooltip");
	
	//add tooltips to the editor buttons
	d3.selectAll(".btn")
		.on("mouseover", function(){
			if(!this.data){ //prevent browser default tooltips
				this.data = this.title;
				this.title = "";
			}
			tooltip
	            .style("left", d3.event.pageX+"px")
	            .style("top", d3.event.pageY+25+"px")
				.style("visibility", "visible")
	            .html(this.data);
		})
		.on("mouseout", function(event){
			tooltip.style("visibility", "hidden");
		});

	$("#edit")
		.prop("checked", false)
		.click(function(){
			$("#network").toggleClass("edit");
			$("#editor").toggle();
		});

	$("#layout")
		.click(function(){
			$("#out").show(); 
			printNewJSON(graph);
		});

	// build the arrow.
	/*svg.append("svg:defs").selectAll("marker")
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
	    .attr("d", "M0,-5L10,0L0,5");*/

	var path = svg.append("svg:g").selectAll("path")
	    .data(force.links())
	  .enter().append("svg:path")
	    .attr("class", function(d) { return "link " + d.connection; });
		//.attr("marker-end", "url(#end)");

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(force.nodes())
	  .enter().append("svg:circle")
		.attr("r", function(d) { return r(d.weight) || 5; })
		.classed("fixed", function(d){ return d.fixed; })
		.on("mouseover", mouseover)
	    .on("mouseout", mouseout)
		.on("dblclick", dblclick)
		//.style("fill", function(d) { return color(d.group); })
	    .call(force.drag);

	var text = svg.append("svg:g").selectAll("g")
	    //.data(force.nodes().filter(function(d) {return d.weight >=3;}))
		.data(force.nodes())
	  .enter().append("svg:g")
		.classed("small", function(d){ return d.weight<3; });

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
	    /*var dx = d.target.x - d.source.x,
	        dy = d.target.y - d.source.y,
	        dr = Math.sqrt(dx * dx + dy * dy); //this is for curved lines*/
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
		var me = d3.select(this);

		if(!me.tip){
			var data = me.datum();

			var tip = data.name+"<ul>";
			for(var i=0; i<graph.links.length; i++){
				var thisLink = graph.links[i];
				if(thisLink.source.index === data.index){
					tip += "<li>"+thisLink.connection+" "+thisLink.target.name+"</li>";
				}
				if(thisLink.target.index === data.index){
					tip += "<li>"+thisLink.source.name+" is/was "+thisLink.connection+"</li>";
				}
			}
			tip += "</ul>";

			me.tip = tip; //store it so we don't have to parse all that again
			me.xPosition = data.px+40;
		    me.yPosition = data.py-20;
		}
        tooltip
            .style("left", me.xPosition+"px")
            .style("top", me.yPosition+"px")
			.style("visibility", "visible")
            .html(me.tip);

		me.transition()
			.duration(5)
			.style("fill", "#636363");
	}//mouseover

	function mouseout() {
		d3.select(this).transition()
			.duration(750)
			.style("fill", "#CCCCCC");

		tooltip.style("visibility", "hidden");
	}

	function dblclick(){
		d3.select(this)
			.classed("fixed", false)
			.datum().fixed = false;
	}
});//d3.json
function printNewJSON(json){
	var newNodes = [], newLinks = [];
	for (var i=0; i<json.nodes.length; i++){
		var node = json.nodes[i];
		newNodes.push({"name": node.name, "x": node.x, "y": node.y, "fixed": node.fixed});
	}
	for(var i=0; i<json.links.length; i++){
		var link = json.links[i];
		newLinks.push({"notes": link.notes, "source": link.source.index, "connection": link.connection, "target": link.target.index});
	}
	var newJson = {"nodes": newNodes, "links": newLinks};
	$("#out").html(JSON.stringify(newJson));
}
}());//initialize