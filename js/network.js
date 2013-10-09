(function () {
d3.json("data/network.json", function(error, graph) {
	var w = 700, h = 500, r = d3.scale.sqrt().domain([0, 20]).range([0, 20]);

	if(!graph.bilinks){ //for JSON that wasn't created by this editor
		//set up for the Bezier curves
		var nodes = graph.nodes.slice(), links = [], bilinks = [];
		graph.links.forEach(function(link) {
		    var s = nodes[link.source],
		        t = nodes[link.target],
		        i = {}; // intermediate node
		    nodes.push(i);
		    links.push({source: s, target: i}, {source: i, target: t});
		    bilinks.push([s, i, t]);
		});
	}
	else{
		var nodes = graph.nodes.slice(), bilinks = graph.bilinks.slice(), links = [];
		bilinks.forEach(function(link){
			for(var i=0; i<link.length; i++){
				link[i] = nodes[link[i]]; //so link path can stay in sync with node when it moves, I think
			}
			links.push({source: link[0], target: link[1]}, {source: link[1], target: link[2]});
		});
	}

	var force = d3.layout.force()
	    .nodes(nodes)
	    .links(links)
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
			printNewJSON(nodes, graph.links, bilinks);
		});

	d3.select("#unfix")
		.on("click", function(){
			force.stop();
			d3.selectAll(".fixed")
				.classed("fixed", false)
				.data(this.data, function(d){ d.fixed = 0; return d; });
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
	    .data(bilinks)
	  .enter().append("svg:path")
	    .attr("class", function(d, i) {
			var link = graph.links[i];
			var classes = link.connection;
			if(link.notes){ d.notes = link.notes; classes += " notes"; } //so we can set listeners for only those with data to show
			return "link " + classes;
		});
		//.attr("marker-end", "url(#end)");

	d3.selectAll(".notes")
		.on("mouseover", function(d){
			d3.select(this).style("stroke-width", "3px")
			if(!d.xPosition){
				d.xPosition = d3.event.pageX;
				d.yPosition = d3.event.pageY;
			}
			placeTip(d.xPosition, d.yPosition, d.notes);
		})
		.on("mouseout", function(d){
			d3.select(this).style("stroke-width", "1.5px"); 
			tooltip.style("display", "none");
		});

	var circle = svg.append("svg:g").selectAll("circle")
	    .data(force.nodes())
	  .enter().append("svg:circle")
		.attr("r", function(d){ if(d.name){ return r(d.weight); } return 2; })
		.attr("class", function(d){
			if(!d.name){ return "helper"; }
			else if(d.fixed){ return "node fixed"; }
			return "node"; //nothing is currently accessing this
		})
		//these are being added to the link helpers too, but we won't use those in production so fine for now
		.on("mouseover", mouseover)
	    .on("mouseout", mouseout)
		.on("dblclick", dblclick)
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
	    .text(function(d) { return d.name; });

	text.append("svg:text")
	    .attr("x", 8)
	    .attr("y", ".31em")
	    .text(function(d) { return d.name; });

	function tick() {
	  path.attr("d", function(d) {
	    return "M" + d[0].x + "," + d[0].y + "S" + d[1].x + "," + d[1].y + " " + d[2].x + "," + d[2].y;
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

			var tip = data.name+" <span class='title'>"+graph.nodes[data.index].title+"</span><ul>";
			for(var i=0; i<graph.links.length; i++){
				var link = graph.links[i]; //use org link arr to evaluate source/target nodes w/o nonsense link between
				if(link.source.index === data.index){
					console.log(graph.nodes[link.target.index])
					
					tip += "<li>"+link.connection+" "+graph.nodes[link.target.index].name+"</li>";
				}
				if(link.target.index === data.index){
					tip += "<li>"+graph.nodes[link.source.index].name+" is/was "+link.connection+"</li>";
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
function printNewJSON(nodes, links, bilinks){
	var newNodes = [], newLinks = [], newBilinks = [];
	for (var i=0; i<nodes.length; i++){
		var node = nodes[i];
		newNodes.push({"name": node.name, "title": node.title, "x": node.x, "y": node.y, "fixed": node.fixed});
	}
	for(var i=0; i<links.length; i++){
		var link = links[i];
		newLinks.push({"notes": link.notes, "source": link.source, "connection": link.connection, "target": link.target});
	}
	for (var i=0; i<bilinks.length; i++){
		var bilink = bilinks[i];
		newBilinks.push([bilink[0].index, bilink[1].index, bilink[2].index]);
	}
	var newJson = {"nodes": newNodes, "links": newLinks, "bilinks": newBilinks};
	document.getElementById("out").innerHTML = JSON.stringify(newJson);
}
}());//initialize