(function () {
d3.json("data/network_raw.json", function(error, graph) {
	var w = 700, h = 500, r = d3.scale.sqrt().domain([0, 20]).range([0, 20]);
	var force = d3.layout.force()
	    .nodes(graph.nodes)
	    .links(graph.links)
	    .size([w, h])
	    //.linkDistance(20)
	    .charge(-100)
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
				this.xPosition = d3.event.pageX;
				this.yPosition = d3.event.pageY+25;
			}
			placeTip(this.xPosition, this.yPosition, this.data);
		})
		.on("mouseout", function(event){
			tooltip.style("display", "none");
		});

	d3.select("#edit")
		.property("checked", false)
		.on("click", function(){
			document.getElementById("container").classList.toggle("edit");
		});

	d3.select("#layout")
		.on("click", function(){
			document.getElementById("out").style.display = "block"; 
			printNewJSON(graph);
		});

	d3.select("#unfix")
		.on("click", function(){
			force.stop();
			d3.selectAll(".fixed")
				.classed("fixed", false)
				.each(function(d){ d.fixed = 0; });
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
	    .attr("class", function(d, i) {
			var classes = d.connection;
			if(d.notes){ d.index = i; classes += " notes"; } //so we can annotate only those with data and store index to match links and annotations
			return "link " + classes;
		});
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
	
	var annotated = svg.append("svg:g").selectAll("circle")
		.data(path[0].filter(function(d){ return d.__data__.notes; }))
	  .enter().append("svg:circle")
		.attr("r", 2)
		.attr("class", "annotation notes");

	//add tooltips to annotations AND their corresponding links
	d3.selectAll(".notes")
		.on("mouseover", function(d){
			d.index = d.index || d.__data__.index; //data is nested differently on links vs annotations

			d3.select(path[0][d.index]).style("stroke-width", "3px");
			//annotated.filter(function(a){ return a.__data__.index === d.index; }).style("stroke-width", "1.5px");

			if(!d.xPosition){
				d.xPosition = d3.event.pageX;
				d.yPosition = d3.event.pageY;
			}
			placeTip(d.xPosition, d.yPosition, d.notes || d.__data__.notes);
		})
		.on("mouseout", function(d){
			d3.select(path[0][d.index]).style("stroke-width", "1.5px");
			tooltip.style("display", "none");
		});

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
	
	  annotated.attr("transform", function(d){
	    var l = d.getTotalLength()/2;
	    var p = d.getPointAtLength(l);
	    return "translate(" + p.x + "," + p.y + ")";
	  });
	}

	function mouseover() {
		var me = d3.select(this);

		if(!me.tip){
			var data = me.datum();

			var tip = data.name+" <span class='title'>"+data.title+"</span><ul>";
			for(var i=0; i<graph.links.length; i++){
				var link = graph.links[i];

				if(link.source.index === data.index){
					tip += "<li>"+link.connection+" "+link.target.name+"</li>";
				}
				if(link.target.index === data.index){
					tip += "<li>"+link.source.name+" "+link.connection+"</li>";
				}
			}
			tip += "</ul>";

			me.tip = tip; //store it so we don't have to parse all that again
			me.xPosition = data.px+40;
		    me.yPosition = data.py-20;
		}
		placeTip(me.xPosition, me.yPosition, me.tip);
		
		me.transition()
			.duration(5)
			.style("fill", "#636363");
	}//mouseover

	function mouseout() {
		d3.select(this).transition()
			.duration(750)
			.style("fill", "#CCCCCC");

		tooltip.style("display", "none");
	}

	function dblclick(){
		d3.select(this)
			.classed("fixed", false)
			.datum().fixed = false;
	}

	function placeTip(x, y, html){
		tooltip
            .style("left", x+"px")
            .style("top", y+"px")
			.style("display", "block")
            .html(html);
	}
});//d3.json
function printNewJSON(json){
	var newNodes = [], newLinks = [];
	for (var i=0; i<json.nodes.length; i++){
		var node = json.nodes[i];
		newNodes.push({"name": node.name, "title": node.title, "x": node.x, "y": node.y, "fixed": node.fixed});
	}
	for(var i=0; i<json.links.length; i++){
		var link = json.links[i];
		newLinks.push({"notes": link.notes, "source": link.source.index, "connection": link.connection, "target": link.target.index});
	}
	var newJson = {"nodes": newNodes, "links": newLinks};
	document.getElementById("out").innerHTML = JSON.stringify(newJson);
}
}());//initialize