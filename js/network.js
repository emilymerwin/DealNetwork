(function () {
d3.json("data/network.json", function(error, graph) {
	var w = parseInt(d3.select("body").style("width")), h = 500, r = d3.scale.sqrt().domain([0, 20]).range([0, 20]);
	var nodes = graph.nodes.slice(), bilinks = graph.bilinks.slice(), links = [];
	var original = true;

	bilinks.forEach(function(link){
		for(var i=0; i<link.length; i++){
			link[i] = nodes[link[i]]; //so link path can stay in sync with node when it moves, I think
		}
		links.push({source: link[0], target: link[1]}, {source: link[1], target: link[2]});
	});

	if(w < 700){ //adjust coordinates for smaller screens
		h = w*h/700+75; //stretch it a little vertically since we have more screen to work with that way
		nodes.forEach(function(node){
			node.x = node.x*(w/700);
			node.y = node.y*(h/500);
		});
	}

	var force = d3.layout.force()
	    .nodes(nodes)
	    .links(links)
	    .size([w, h])
	    .linkDistance(5)
	    .gravity(0)
	    .charge(0)
	    .on("tick", tick)
	    .start();

	var svg = d3.select("#network").append("svg:svg")
	    .attr("width", w)
	    .attr("height", h);

	var drag = force.drag()
		.on("dragstart", dragstart);

	function dragstart(d) {
		if(original){ //release fixed bilinks if user starts to re-arrange nodes to avoid crazy arcs
			d3.selectAll(".link").data().forEach(function(d){ d[1].fixed = 0; });
			original = false;
		}
		d.fixed = true;
	}

	var tooltip = d3.select("#tooltip");

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
	    .data(bilinks)
	  .enter().append("svg:path")
	    .attr("class", function(d, i) {
			var link = graph.links[i];
			var classes = link.connection;
			if(link.notes){ d.notes = link.notes; d.index = i; classes += " notes"; } //so we can annotate only those with data and store index to match links and annotations
			return "link " + classes;
		});
		//.attr("marker-end", "url(#end)");
	d3.select("#labels")
		.property("checked", false)
		.on("click", function(){
			document.getElementById("network").classList.toggle("edit");
		});

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(graph.nodes.filter(function(d){ return d.name; }))
	  .enter().append("svg:circle")
		.attr("r", function(d){ return r(d.weight); })
		.on("mouseover", mouseover)
	    .on("mouseout", mouseout)
		//.style("fill", function(d) { return color(d.group); })
	    .call(force.drag);

	var text = svg.append("svg:g").selectAll("g")
	    //.data(force.nodes().filter(function(d) {return d.weight >=3;}))
		.data(graph.nodes)
	  .enter().append("svg:g")
		.classed("small", function(d){ return d.weight<3; });

	// A copy of the text with a thick white stroke for legibility.
	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .attr("class", "shadow")
	    //.text(function(d) { return d.name; });
		.each(function(d){
			if(d.name === "Ga. Govt. Transparency & Campaign Finance Commission"){
				d3.select(this).append("tspan").text("Ga. Govt. Transparency ");
				d3.select(this).append("tspan")
					.attr('x', 15)
					.attr('dy', 15)
					.text("& Campaign Finance Commission");
			} else {
				d3.select(this).text(function(d){ return d.name; });
			}
		});

	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    //.text(function(d) { return d.name; });
		.each( function(d){
			if(d.name === "Ga. Govt. Transparency & Campaign Finance Commission"){
				d3.select(this).append("tspan").text("Ga. Govt. Transparency ");
				d3.select(this).append("tspan")
					.attr('x', 15)
					.attr('dy', 15)
					.text("& Campaign Finance Commission");
			} else {
				d3.select(this).text(function(d){ return d.name; });
			}
		});
	
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
				d.xPosition = d3.event.pageX+10;
				d.yPosition = d3.event.pageY-5;
			}
			placeTip(d.xPosition, d.yPosition, d.notes || d.__data__.notes);
		})
		.on("mouseout", function(d){
			d3.select(path[0][d.index]).style("stroke-width", "1.5px");
			tooltip.style("display", "none");
		});

	function tick() {
	  circle.attr("transform", function(d, i) {
		rad = d3.select(this).attr("r");
		d.x = Math.max(rad, Math.min(w - rad, d.x)); //constrain nodes to layout bounds
		d.y = Math.max(rad, Math.min(h - rad, d.y));
	    return "translate(" + d.x + "," + d.y + ")";
	  });

	  path.attr("d", function(d) {
	    return "M" + d[0].x + "," + d[0].y + "S" + d[1].x + "," + d[1].y + " " + d[2].x + "," + d[2].y;
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

			var tip = data.name+" <span class='title'>"+graph.nodes[data.index].title+"</span><ul>";
			for(var i=0; i<graph.links.length; i++){
				var link = graph.links[i]; //use org link arr to evaluate source/target nodes w/o nonsense link between

				if(link.source === data.index){
					tip += "<li>"+link.connection+" "+graph.nodes[link.target].name+"</li>";
				}
				if(link.target === data.index){
					tip += "<li>"+graph.nodes[link.source].name+" "+link.connection+"</li>";
				}
			}
			tip += "</ul>";

			me.tip = tip; //store it so we don't have to parse all that again
			me.xPosition = d3.event.pageX+20;
		    me.yPosition = d3.event.pageY-20;
			if(me.xPosition + 140 > w){ //keep it in the container
				me.xPosition = me.xPosition - 107;
				me.yPosition = me.yPosition + 40;
			}
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

	function placeTip(x, y, html){
		tooltip
            .style("left", x+"px")
            .style("top", y+"px")
			.style("display", "block")
            .html(html);
	}
});//d3.json
}());//initialize