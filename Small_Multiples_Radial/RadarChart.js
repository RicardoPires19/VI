//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better 
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end, 
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html

var RadarChart = {
  draw: function(id, d, options){
  var cfg = {
	 radius: 5,
	 w: 600, //width do grafico todo
	 h: 600, //height " " "
	 factor: 1,
	 factorLegend: .85,
	 levels: 3, //number of "spider webs"
	 maxValue: 0, //max attribute value (upper limit of range)
	 radians: 2 * Math.PI,
	 opacityArea: 0.5, //opacity of options 
	 ToRight: 5, //scale text gap
 	 TranslateX: 80, //radar center coordinate
	 TranslateY: 30, //radar center coordinate
	 ExtraWidthX: 100,
	 ExtraWidthY: 100,
	 color: "#00a0e4",
	 title: "Title Goes Here!",
	 showAxisName: true,
	 htmlID: "#body",  
	 maxRatingVal: 0,  //!!! Tentativa para normalizar escala !!!
	 maxVotesVal: 0,
	 maxProduBudgetVal: 0,
	 maxDomProfit: 0,
	 maxTotalProfit: 0, 
	 maxWorldProfit: 0  
	};
	
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){
		  cfg[i] = options[i];
		}
	  }
	}
	
	//Determinar valor maximo nos dados - isto tem de ser feito fora do codigo do radar (pq ee preciso comparar generos) e 1 vez por cada eixo
	cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));
	var allAxis = (d[0].map(function(i, j){return i.axis})); 
	var total = allAxis.length; //total - number of axis (attributes)
	var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	var Format = d3.format('^');
	d3.select(id).select("svg").remove();
	
	var g = d3.select(id)
			.append("svg")
			.attr("width", cfg.w+cfg.ExtraWidthX)
			.attr("height", cfg.h+cfg.ExtraWidthY)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			;

	var tooltip;
	
	//Circular segments - spider web
	for(var j=0; j<cfg.levels-1; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data(allAxis)
	   .enter()
	   .append("svg:line")
	   .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	   .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	   .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	   .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	   .attr("class", "line")
	   .style("stroke", "grey")
	   .style("stroke-opacity", "0.75")
	   .style("stroke-width", "0.3px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	}

	//Text indicating at what % each level is
	/*for(var j=0; j<cfg.levels; j++){
	  var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	  g.selectAll(".levels")
	   .data([1]) //dummy data
	   .enter()
	   .append("svg:text")
	   .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
	   .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
	   .attr("class", "legend")
	   .style("font-family", "sans-serif")
	   .style("font-size", "10px")
	   .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
	   .attr("fill", "#737373")
	   .text(Format((j+1)*cfg.maxValue/cfg.levels));
	}*/
	
	series = 0;

	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "axis");

	//Desenhar linhas
	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "line")
		.style("stroke", "grey")
		.style("stroke-width", "1px");
	
	//Texto dos atributos
	if (cfg.showAxisName == true) 
		axis.append("text")
			.attr("class", "legend")
			.text(function(d){return d})
			.style("font-family", "sans-serif")
			.style("font-size", "11px")
			.attr("text-anchor", "middle")
			.attr("dy", "1.5em")
			.attr("transform", function(d, i){return "translate(0, -10)"})
			.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
			.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});
	
 
 	//Desenhar area
	d.forEach(function(currentAttribute, cMovIndex){
	  /* !!! Tentativa para normalizar escala !!!	
	  switch(currentAttribute.axis) {
	  	case "Rating (avg)":
	  		cfg.maxValue = cfg.maxRatingVal; break;
	  	case "Votes (avg)":
	  		cfg.maxValue = cfg.maxVotesVal; break;
	  	case "Production Budget (avg)":
	  		cfg.maxValue = cfg.maxProduBudgetVal; break;
	  	case "Domestic Profit (avg)":
	  		cfg.maxValue = cfg.maxDomProfit; break;
	  	case "Worldwide Profit (avg)":
	  		cfg.maxValue = cfg.maxWorldProfit; break;
	  	case "Total Profit (avg)":
	  		cfg.maxValue = cfg.maxTotalProfit; break;
	  }
	  */

	  dataValues = [];
	  g.selectAll(".nodes")
		.data(currentAttribute, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		  ]);
		});
	  dataValues.push(dataValues[0]);
	  g.selectAll(".area")
					 .data([dataValues])
					 .enter()
					 .append("polygon")
					 .attr("class", "radar-chart-serie"+series)
					 .style("stroke-width", "2px")
					 .style("stroke", d3.rgb(cfg.color))
					 .attr("points",function(d) {
						 var str="";
						 for(var pti=0;pti<d.length;pti++){
							 str=str+d[pti][0]+","+d[pti][1]+" ";
						 }
						 return str;
					  })
					 .style("fill", function(j, i){return d3.rgb(cfg.color)})
					 .style("fill-opacity", cfg.opacityArea)
					 .on('mouseover', function (d){
										z = "polygon."+d3.select(this).attr("class");
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", 0.1); 
										g.selectAll(z)
										 .transition(200)
										 .style("fill-opacity", .7);
									  })
					 .on('mouseout', function(){
										g.selectAll("polygon")
										 .transition(200)
										 .style("fill-opacity", cfg.opacityArea);
					 });
	  series++;
	});
	series=0;


	//Desenhar pontos
	d.forEach(function(y, x){
	  
	  /* !!! Tentativa para normalizar escala !!!
	  switch(currentAttribute.axis) {
	  	case "Rating (avg)":
	  		cfg.maxValue = cfg.maxRatingVal; break;
	  	case "Votes (avg)":
	  		cfg.maxValue = cfg.maxVotesVal; break;
	  	case "Production Budget (avg)":
	  		cfg.maxValue = cfg.maxProduBudgetVal; break;
	  	case "Domestic Profit (avg)":
	  		cfg.maxValue = cfg.maxDomProfit; break;
	  	case "Worldwide Profit (avg)":
	  		cfg.maxValue = cfg.maxWorldProfit; break;
	  	case "Total Profit (avg)":
	  		cfg.maxValue = cfg.maxTotalProfit; break;
	  }
	  */
	  
	  g.selectAll(".nodes")
		.data(y).enter()
		.append("svg:circle")
		.attr("class", "radar-chart-serie"+series)
		.attr('r', cfg.radius)
		.attr("alt", function(j){return Math.max(j.value, 0)})
		.attr("cx", function(j, i){
		  dataValues.push([
			cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total))
		]);
		return cfg.w/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-(Math.max(j.value, 0)/cfg.maxValue)*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.attr("data-id", function(j){return j.axis})
		.style("fill", d3.rgb(cfg.color)).style("fill-opacity", .9)
		//Show data point value on mouseover
		.on('mouseover', function (d){
					newX =  parseFloat(d3.select(this).attr('cx')) - 10;
					newY =  parseFloat(d3.select(this).attr('cy')) - 5;
					
					tooltip
						.attr('x', newX)
						.attr('y', newY)
						.text(Format(d.value))
						.transition(200)
						.style('opacity', 1);
						
					z = "polygon."+d3.select(this).attr("class");
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", 0.1); 
					g.selectAll(z)
						.transition(200)
						.style("fill-opacity", .7);
				  })
		//Hide data point value on mouseout
		.on('mouseout', function(){
					tooltip
						.transition(200)
						.style('opacity', 0);
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", cfg.opacityArea);
				  })
		.append("svg:title")
		.text(function(j){return Math.max(j.value, 0)});

	  series++;
	});
	//Tooltip
	tooltip = g.append('text')
			   .style('opacity', 0)
			   .style('font-family', 'sans-serif')
			   .style('font-size', '13px');

	////////////////////////////////////////////
	/////////// Radar Title ////////////////////
	////////////////////////////////////////////
	var svg = d3.select(cfg.htmlID)
		.selectAll('svg')
		.append('svg')
		.attr("width", w + cfg.ExtraWidthX)
		.attr("height", h + cfg.ExtraWidthY)

	var text = svg.append("text")
		.attr("class", "title")
		//.attr('transform', 'translate(90,0)') 
		.attr("x", cfg.TranslateX + 30)
		.attr("y", cfg.TranslateY - 15)
		.attr("font-size", "20px")
		.attr("fill", "#404040")
		.text(cfg.title);	
  }
};


