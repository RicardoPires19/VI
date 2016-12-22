var dataset;
var full_dataset;
var year = 1980;


d3.json("movies_gross.json", function (data) {
	full_dataset = data;

	var filteredJson = data.filter(function (row) {
		if(row.year == year) {
			return true;
		} else {
			return false;
		}
	});
	dataset = filteredJson;
	gen_vis();
})


function gen_vis(){

	var w = 600;
	var h = 600;
	var padding = 30;
	var highestB = Math.max.apply(Math,dataset.map(function(o){return o.ProductionBudget;}))
	var highestG = Math.max.apply(Math,dataset.map(function(o){return o.WorldwideGross;}))
	var lowestB = Math.min.apply(Math,dataset.map(function(o){return o.ProductionBudget;}))
	var lowestG = Math.min.apply(Math,dataset.map(function(o){return o.WorldwideGross;}))

	var svg = d3.select("#the_chart")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

	var cscale = d3.scaleLinear()
	.domain([ Math.min.apply(Math,dataset.map(function(o){return o.rating;})),
	          Math.max.apply(Math,dataset.map(function(o){return o.rating;}))])
	.range(["red", "blue"]);
	
	var xscale = d3.scaleLog()
	.domain([Math.min(lowestB, 0.1), (highestB/1000000) + 5])
	.range([padding,w-padding]);

	var hscale = d3.scaleLog()
	.domain([(highestG/1000000) + 5, Math.min(lowestG, 0.1)])
	.range([padding,w-padding]);
	
	var bar_w = 15; 
	var xaxis = d3.axisBottom()
	.scale(d3.scaleLog().domain([0.5, highestB/1000000])
	.range([padding,w-padding]))
	.tickFormat(d3.format("d"))
	.ticks(dataset.length/8);
	
	
	var yaxis = d3.axisLeft()
	.scale(d3.scaleLog().domain([highestG/1000000, 0.5])
	.range([padding,w-padding]))
	.tickFormat(d3.format("d"))
	.ticks(dataset.length/8);

	//draw for the first time
	var r = 5; 
	svg.selectAll("circle") 
	.data(dataset)
	.enter().append("circle")
	.attr("r",r) 
	.attr("fill", function(d, i) { return cscale(d.rating); })
	.attr("cx",function(d, i) { 
		if(d.ProductionBudget == 0) { return padding;} 
		return xscale(d.ProductionBudget/1000000); }) 
	.attr("cy",function(d, i) { 
				if(d.WorldwideGross == 0) { return padding;} 
				return hscale(d.WorldwideGross/1000000); })
	.append("title") 
	.text(function(d) { return d.title;});
	
	svg.append("g")
	.attr("transform", "translate(30,0)")
	.attr("class", "y axis")
	.call(yaxis);
	
	svg.append("g")
		.attr("transform", "translate(0, " + (h - padding) + ")")
		.attr("class", "x axis")
		.call(xaxis);
	
	svg.selectAll("circle").append("tittle")
		.data(dataset)
		.text(function(d) { return d.tittle; });
	
	
	
	
	//update process
	d3.selectAll("#old").on("click", function(){
		year++;
		if(year > 2016) year = 2016;
		var data = full_dataset;
		var filteredJson = data.filter(function (row) {
			if(row.year == year) {
				return true;
			} else {
				return false;
			}
		});
		dataset = filteredJson;
		
		highestB = Math.max.apply(Math, dataset.map(function(o){return o.ProductionBudget;}))
		highestG = Math.max.apply(Math,dataset.map(function(o){return o.WorldwideGross;}))
		lowestB = Math.min.apply(Math,dataset.map(function(o){return o.ProductionBudget;}))
		lowestG = Math.min.apply(Math,dataset.map(function(o){return o.WorldwideGross;}))
		if(lowestG == null || lowestG == 0) lowestG = 0.001;
		if(lowestB == null || lowestB == 0) lowestB = 0.001;
		
		
		xscale = d3.scaleLog()
		.domain([Math.min(lowestB, 0.001), (highestB/1000000) + 5])
		.range([padding,w-padding]);
		
		hscale = d3.scaleLog()
		.domain([(highestG/1000000) + 5, Math.min(lowestG, 0.001)])
		.range([padding,w-padding]);

		bar_w = Math.floor((w-padding*2)/dataset.length)-1;
		svg.selectAll("circle")
			.data(dataset)
			.transition()
			.duration(1000)
			.attr("fill", function(d, i) { return cscale(d.rating); })
			.attr("cy",function(d, i) { 
				if(d.WorldwideGross == 0) { return padding;} 
				return hscale(d.WorldwideGross/1000000); })
			.attr("cx",function(d, i) { 
				if(d.ProductionBudget == 0) { return padding;} 
				return xscale(d.ProductionBudget/1000000); })
			.select("title")
			.text(function(d) { return d.title;});
		
		svg.selectAll("circle")
		.data(dataset)
		.enter()
		.append("circle")
		.attr("fill", function(d, i) { return cscale(d.rating); })
		.attr("cx",function(d, i) { 
				if(d.ProductionBudget == 0) { return padding;} 
				return xscale(d.ProductionBudget/1000000); })
		.attr("cy",function(d, i) { 
				if(d.WorldwideGross == 0) { return padding;} 
				return hscale(d.WorldwideGross/1000000); })
		.attr("r", r)
		.append("title") 
		.text(function(d) { return d.title;});

		// Remove old
		svg.selectAll("circle")
		.data(dataset)
		.exit()
		.remove()
		
		
		xaxis.scale(d3.scaleLog().domain([0.5, highestB/1000000])
		.range([padding+bar_w/2,w-padding-bar_w/2]))
		.tickFormat(d3.format("d"))
		.ticks(dataset.length/8);
		
		d3.select(".x.axis")
			.transition()
			.duration(1000)
			.call(xaxis);
		
		yaxis.scale(d3.scaleLog().domain([highestG/1000000, 0.5])
				.range([padding+bar_w/2,w-padding-bar_w/2]))
				.tickFormat(d3.format("d"))
				.ticks(dataset.length/8);
		
		d3.select(".y.axis")
		.transition()
		.duration(1000)
		.call(yaxis);
	});

}