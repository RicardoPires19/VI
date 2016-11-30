function treemap(){

  var width = 800,
      height = 600;
      
  var treemap = d3.treemap()
      .size([width, height])
      .padding(1);
      
  var color = d3.scaleOrdinal()
                .range(d3.schemeCategory10
                .map(function(c) { c = d3.rgb(c); c.opacity = 0.7; return c; }));

  var format = d3.format(",d");

  var stratify = d3.stratify()
      .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

  d3.csv("output.csv", type, function(error, data) {
    if (error) throw error;
    
    var filteredData = data.filter(function(d) 
    { 
       	if(d.id == "year" || d.id.startsWith("year.1980")){
       		return d;
       	}
    })


    var root = stratify(filteredData)
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.height - a.height || b.value - a.value; });

    
    
    treemap(root);
    
    d3.select("body")
    .selectAll(".node")
    .data(root.leaves())
    .enter().append("div")
        .attr("class", "node")
        .attr("title", function(d) { return d.id + "\n" + format(d.value); })
        .style("left", function(d) { return d.x0 + "px"; })
        .style("top", function(d) { return d.y0 + "px"; })
        .style("width", function(d) { return d.x1 - d.x0 + "px"; })
        .style("height", function(d) { return d.y1 - d.y0 + "px"; })
        .style("background", function(d) { while(d.depth > 2) d = d.parent; return color(d.id); })
        .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1).split(/(?=[A-Z][^A-Z])/g).join("\n"); })
    .append("div")
        .attr("class", "node-value")
    .text(function(d) { return format(d.value); })
  });
  

  function type(d) {
    d.value = +d.value;
    return d;
  }
  
}
