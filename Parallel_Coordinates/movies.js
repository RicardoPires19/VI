// Parallel Coordinates
// Copyright (c) 2012, Kai Chang
// Released under the BSD License: http://opensource.org/licenses/BSD-3-Clause

var width = document.body.clientWidth,
	height = d3.max([document.body.clientHeight-540, 240]);

var m = [60, 0, 10, 0],
	w = width - m[1] - m[3],
	h = height - m[0] - m[2],
	xscale = d3.scale.ordinal().rangePoints([0, w], 1),
	yscale = {},
	dragging = {},
	line = d3.svg.line(),
	axis = d3.svg.axis().orient("left").ticks(1+height/50),
	data,
	foreground,
	background,
	highlighted,
	dimensions,
	render_speed = 50,
	brush_count = 0,
	excluded_groups = [];
/**
 * @var selected_value : filme seleccionado na lista (random) de filmes
 * @var mouseovered_movie : movie that is mouse overed in the list (NOT SELECTED)
 * @var sample_size : number of movies in the movies-list, and max number of selected movies
 */
var selected_movie = [];
var mouseovered_movie = null;
var sample_size = 15;
/**
 * @var colors = array that returns that given a genre returns its color
 * variable to map a gender to a color
 * Important: only the 11 most relevant genres are displayed
 */
var colors = {
  "Action": [0,50,50],          // RED
  "Adventure": [107,35,50],     // GREEN
  "Comedy": [60,50,50],         // YELLOW
  "Crime": [250,50,30],         // DARK BLUE
  "Drama": [310,50,40],         // PINK - VIOLET
  "Fantasy": [190,50,50],       // LIGHT BLUE
  "Horror": [5,100,15],         // DARK RED
  "Mystery": [270,70,50],       // PURPLE
  "Romance": [340,50,50],       // PINK - RED
  "Sci-Fi": [30,60,50],         // ORANGE
  "Thriller": [115,70,25],      // 
  "other": [20,49,49]			// 
};

// Scale chart and canvas height
d3.select("#chart")
	.style("height", (h + m[0] + m[2]) + "px")

d3.selectAll("canvas")
	.attr("width", w)
	.attr("height", h)
	.style("padding", m.join("px ") + "px");


// Foreground canvas for primary view
foreground = document.getElementById('foreground').getContext('2d');
foreground.globalCompositeOperation = "destination-over";
foreground.strokeStyle = "rgba(0,100,160,0.1)";
foreground.lineWidth = 1.7;
foreground.fillText("Loading...",w/2,h/2);

// Highlight canvas for temporary interactions
highlighted = document.getElementById('highlight').getContext('2d');
highlighted.strokeStyle = "rgba(0,100,160,1)";
highlighted.lineWidth = 4;

// Background canvas
background = document.getElementById('background').getContext('2d');
background.strokeStyle = "rgba(0,100,160,0.1)";
background.lineWidth = 1.7;

// SVG for ticks, labels, and interactions
var svg = d3.select("svg")
	.attr("width", w + m[1] + m[3])
	.attr("height", h + m[0] + m[2])
	.append("svg:g")
	.attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Load the data and visualization
d3.csv("movies_gross.csv", function(raw_data) {
	data = raw_data;
	gen_parallel();
});



/**
 * @function gen_parallel
 * Description: function to generate the parallel coordinates
 */
function gen_parallel(){
	// Extract the list of numerical dimensions and create a scale for each.
	// (PS: Creation of the Axis of the parallel coordinates)
	xscale.domain(dimensions = d3.keys(data[0]).filter(function(k) {
					return  k != "title" &&
							k != "originalTitle" &&
							k != "votes_orig" &&
							k != "genres/0" &&
							k != "genres/1" &&
							k != "genres/2" &&
							k != "genres/3" &&
							k != "genres/4" &&
							k != "genres/5" &&
							k != "genres/6" &&
							k != "genres/7" &&
							k != "DomesticGross" &&
							k != "WorldwideGross" &&
							k != "DomesticGross_orig" &&
							k != "WorldwideGross_orig" &&
							 (yscale[k] =  d3.scale.linear()
												.domain(d3.extent(data, function(d) { return +d[k]; }))
												.range([h, 0]));
					}));

	// Add a group element for each dimension.
	var g = svg.selectAll(".dimension")
		.data(dimensions)
		.enter()
			.append("svg:g")
			.attr("class", "dimension")
			.attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
			.call(d3.behavior.drag()
			///////////// CHANGE ///////////
            .origin(function(d) { return {xscale: xscale(d)}; })
			////////////////////////////////
			.on("dragstart", function(d) {
				dragging[d] = this.__origin__ = xscale(d);
				this.__dragged__ = false;
				d3.select("#foreground").style("opacity", "0.35");
			})
			.on("drag", function(d) {
				dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
				dimensions.sort(function(a, b) { return position(a) - position(b); });
				xscale.domain(dimensions);
				g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
				brush_count++;
				this.__dragged__ = true;

				// Feedback for axis deletion if dropped
				if (dragging[d] < 12 || dragging[d] > w-12) {
				d3.select(this).select(".background").style("fill", "#b00");
				} else {
				d3.select(this).select(".background").style("fill", null);
				}
			})
			.on("dragend", function(d) {
				if (!this.__dragged__) {
					// no movement, invert axis
					var extent = invert_axis(d);
				} else {
				// reorder axes
				d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");

				var extent = yscale[d].brush.extent();
				}

				// remove axis if dragged all the way left
				if (dragging[d] < 12 || dragging[d] > w-12) {
				remove_axis(d,g);
				}

				// TODO required to avoid a bug
				xscale.domain(dimensions);
				update_ticks(d, extent);

				// rerender
				d3.select("#foreground").style("opacity", null);
				brush();
				delete this.__dragged__;
				delete this.__origin__;
				delete dragging[d];
			}))

	// Add an axis and title.
	g.append("svg:g")
		.attr("class", "axis")
		.attr("transform", "translate(0,0)")
		.each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
		.append("svg:text")
			.attr("text-anchor", "middle")
			.attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
			.attr("x", 0)
			.attr("class", "label")
			.text(String)
			.append("title")
			.text("Click to invert. Drag to reorder");

	// Add and store a brush for each axis.
	g.append("svg:g")
		.attr("class", "brush")
		.each(function(d) {d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
		.selectAll("rect")
			.style("visibility", null)
			.attr("x", -23)
			.attr("width", 36)
			.append("title")
			.text("Drag up or down to brush along this axis");

	g.selectAll(".extent")
		.append("title")
		.text("Drag or resize this filter");


	// Render full foreground
	brush();

}

// copy one canvas to another, grayscale
function gray_copy(source, target) {
	var pixels = source.getImageData(0,0,w,h);
	target.putImageData(grayscale(pixels),0,0);
}

// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
function grayscale(pixels, args) {
	var d = pixels.data;
	for (var i=0; i<d.length; i+=4) {
	var r = d[i];
	var g = d[i+1];
	var b = d[i+2];
	// CIE luminance for the RGB
	// The human eye is bad at seeing red and blue, so we de-emphasize them.
	var v = 0.2126*r + 0.7152*g + 0.0722*b;
	d[i] = d[i+1] = d[i+2] = v
	}
	return pixels;
};

// render polylines i to i+render_speed 
function render_range(selection, i, max, opacity) {
	selection.slice(i,max).forEach(function(d) {
	path(d, foreground, color(d["genres/0"],opacity));
	});
};


// simple data table
function data_table(sample) {
	// if there are selected movies
	// they will appear in the list of movies
	if(selected_movie.length > 0)
		sample = merge_sample(sample,selected_movie);
	while(sample.length > 15){
		sample.splice(14,1);
	}

	console.log(sample.length);

	var table = d3.select("#movies-list")
	.html("")
	.selectAll(".row")
		.data(sample)
		.enter()
			.append("div")
			.style("Background", function (d){
				// When a movie is selected highlight the background
				if(elementInArray(d,selected_movie))
					return "hsla(60,100%,50%,0.4)";
				else return null;
			})
			.on("mouseover", function(d){
				// only works if there is no selected movie
				if(selected_movie.length == 0) highlight(d);
			})
			.on("mouseout", function(d){
				// only unhighlights if there is not a selected movie
				if(selected_movie.length == 0) unhighlight(d);
			})
			.on("click", function(d){
				/**
				 * highlights the selected movies
				 * to deselect just click again in the movie
				 * OR click the 'Clear Selection' button
				 */
				// check if the movie is already selected
				var index = selected_movie.lastIndexOf(d);
				// IF the movie is not selected yet...
				if(index < 0){
					// if max number of selections reached -> do nothing
					if(selected_movie.length == sample_size) return;
					// highlights the movie
					highlight(d);
					// add it to the selected movies
					selected_movie.push(d);
				} else {
					unhighlight(d);
					// remove the movie from the selected movies
					selected_movie.splice(index,1);
					// highlight all the other again
					selected_movie.forEach(function(item,index){
						highlight(item);
					})

				}
				brush();
			})



	table
	.append("span")
		.attr("class", "color-block")
		.style("background", function(d) { return color(d["genres/0"],0.85) })

	table
	.append("span")
		.text(function(d)
		{
			if(d["originalTitle"] == 0 )
				return d["title"]
			else return d["originalTitle"]  + " (" + d["title"] +  ")";
		})
}

// Adjusts rendering speed 
function optimize(timer) {
	var delta = (new Date()).getTime() - timer;
	render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
	render_speed = Math.min(render_speed, 50);
	return (new Date()).getTime();
}

// Feedback on rendering progress
function render_stats(i,n,render_speed) {
	d3.select("#rendered-count").text(i);
	d3.select("#rendered-bar")
	.style("width", (100*i/n) + "%");
	d3.select("#render-speed").text(render_speed);
}

// Feedback on selection
function selection_stats(n, total) {
	d3.select("#data-count").text(total);
	d3.select("#selected-count").text(n);
	d3.select("#selected-bar").style("width", (100*n/total) + "%");
}

// Highlight single polyline
function highlight(d) {
	d3.select("#foreground").style("opacity", "0.25");
	// fazer HIGHLIGHT no small multiples AQUI
	//d3.selectAll(".row").style("opacity", function(p) { return (d.group == p) ? null : "0.3" });
	path(d, highlighted, color(d["genres/0"],1));
}

// Remove highlight
function unhighlight() {
	d3.select("#foreground").style("opacity", null);
	//d3.selectAll(".row").style("opacity", null);
	highlighted.clearRect(0,0,w,h);
}

function invert_axis(d) {
	// save extent before inverting
	if (!yscale[d].brush.empty()) {
	var extent = yscale[d].brush.extent();
	}
	if (yscale[d].inverted == true) {
	yscale[d].range([h, 0]);
	d3.selectAll('.label')
		.filter(function(p) { return p == d; })
		.style("text-decoration", null);
	yscale[d].inverted = false;
	} else {
	yscale[d].range([0, h]);
	d3.selectAll('.label')
		.filter(function(p) { return p == d; })
		.style("text-decoration", "underline");
	yscale[d].inverted = true;
	}
	return extent;
}

function path(d, ctx, color) {
	if (color) ctx.strokeStyle = color;
	ctx.beginPath();
	
	var x0 = xscale(0)-15,
		y0 = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
	
	ctx.moveTo(x0,y0);
	
	dimensions.map(function(p,i) {
	var x = xscale(p),
		y = yscale[p](d[p]);
	var cp1x = x - 0.88*(x-x0);
	var cp1y = y0;
	var cp2x = x - 0.12*(x-x0);
	var cp2y = y;
	ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
	x0 = x;
	y0 = y;
	});
	
	ctx.lineTo(x0+15, y0);                               // right edge
	ctx.stroke();
};


function color(d,a) {
	if(colors[d] == null ) d = "other";
	var c = colors[d];
	return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
}

function position(d) {
	var v = dragging[d];
	return v == null ? xscale(d) : v;
}


// Handles a brush event, toggling the display of foreground lines.
// TODO refactor
function brush() {
	brush_count++;
	var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
		extents = actives.map(function(p) { return yscale[p].brush.extent(); });

	// hack to hide ticks beyond extent
	var b = d3.selectAll('.dimension')[0]
				.forEach(function(element, i) {
					var dimension = d3.select(element).data()[0];
					if (_.include(actives, dimension)) {
					var extent = extents[actives.indexOf(dimension)];
					d3.select(element)
						.selectAll('text')
						.style('font-weight', 'bold')
						.style('font-size', '13px')
						.style('display', function() { 
						var value = d3.select(this).data();
						return extent[0] <= value && value <= extent[1] ? null : "none"
						});
					} else {
					d3.select(element)
						.selectAll('text')
						.style('font-size', null)
						.style('font-weight', null)
						.style('display', null);
					}
					d3.select(element)
					.selectAll('.label')
					.style('display', null);
				});;
 
	// bold dimensions with label
	d3.selectAll('.label')
		.style("font-weight", function(dimension) {
			if (_.include(actives, dimension)) return "bold";
			return null;
		});

	// Get lines within extents
	var selected = [];
	data.filter(function(d) {
			return !_.contains(excluded_groups, d.group);
		})
		.map(function(d) {
			return actives.every(function(p, dimension) {
			return extents[dimension][0] <= d[p] && d[p] <= extents[dimension][1];
			}) ? selected.push(d) : null;
		});

	
	// free text search
	var query = d3.select("#search")[0][0].value;
	if (query.length > 0) {
		selected = search(selected, query);
	}



	if (selected.length < data.length && selected.length > 0) {
	d3.select("#keep-data").attr("disabled", null);
	d3.select("#exclude-data").attr("disabled", null);
	} else {
	d3.select("#keep-data").attr("disabled", "disabled");
	d3.select("#exclude-data").attr("disabled", "disabled");
	};

	// total by food group
	//var tallies = _(selected)
	//.groupBy(function(d) { return d.group; })

	// include empty groups
	//_(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });


	// Render selected lines
	paths(selected, foreground, brush_count);
}


// render a set of polylines on a canvas
function paths(selected, ctx, count) {
	var n = selected.length,
		i = 0,
		opacity = d3.min([2/Math.pow(n,0.3),1]),
		timer = (new Date()).getTime();

	selection_stats(n, data.length)
	
	//shuffled_data = _.shuffle(selected);

	shuffled_data = selected;
	shuffled_data.sort(function (a,b){
		return b["totalProfit"] - a["totalProfit"];
	});

	data_table(shuffled_data.slice(0,sample_size));

	ctx.clearRect(0,0,w+1,h+1);

	// render all lines until finished or a new brush event
	function animloop(){
	if (i >= n || count < brush_count) return true;
	var max = d3.min([i+render_speed, n]);
	render_range(shuffled_data, i, max, opacity);
	render_stats(max,n,render_speed);
	i = max;
	timer = optimize(timer);  // adjusts render_speed
	};

	d3.timer(animloop);
}

// transition ticks for reordering, rescaling and inverting
function update_ticks(d, extent) {
	// update brushes
	if (d) {
	var brush_el = d3.selectAll(".brush")
		.filter(function(key) { return key == d; });
	// single tick
	if (extent) {
		// restore previous extent
		brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush));
	} else {
		brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
	}
	} else {
	// all ticks
	d3.selectAll(".brush")
		.each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
	}

	brush_count++;

	show_ticks();

	// update axes
	d3.selectAll(".axis")
	.each(function(d,i) {
		// hide lines for better performance
		d3.select(this).selectAll('line').style("display", "none");

		// transition axis numbers
		d3.select(this)
		.transition()
		.duration(720)
		.call(axis.scale(yscale[d]));

		// bring lines back
		d3.select(this).selectAll('line').transition().delay(800).style("display", null);

		d3.select(this)
		.selectAll('text')
		.style('font-weight', null)
		.style('font-size', null)
		.style('display', null);
	});
}

// Rescale to new dataset domain
function rescale() {
	// reset yscales, preserving inverted state
	dimensions.forEach(function(d,i) {
	if (yscale[d].inverted) {
		yscale[d] = d3.scale.linear()
			.domain(d3.extent(data, function(p) { return +p[d]; }))
			.range([0, h]);
		yscale[d].inverted = true;
	} else {
		yscale[d] = d3.scale.linear()
			.domain(d3.extent(data, function(p) { return +p[d]; }))
			.range([h, 0]);
	}
	});

	update_ticks();

	// Render selected data
	paths(data, foreground, brush_count);
}

// Get polylines within extents
function actives() {
	var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
		extents = actives.map(function(p) { return yscale[p].brush.extent(); });

	// filter extents and excluded groups
	var selected = [];
	data
	.filter(function(d) {
		return !_.contains(excluded_groups, d.group);
	})
	.map(function(d) {
	return actives.every(function(p, i) {
		return extents[i][0] <= d[p] && d[p] <= extents[i][1];
	}) ? selected.push(d) : null;
	});

	// free text search
	var query = d3.select("#search")[0][0].value;
	if (query > 0) {
	selected = search(selected, query);
	}

	return selected;
}

// scale to window size
window.onresize = function() {
	width = document.body.clientWidth,
	height = d3.max([document.body.clientHeight-500, 220]);

	w = width - m[1] - m[3],
	h = height - m[0] - m[2];

	d3.select("#chart")
		.style("height", (h + m[0] + m[2]) + "px")

	d3.selectAll("canvas")
		.attr("width", w)
		.attr("height", h)
		.style("padding", m.join("px ") + "px");

	d3.select("svg")
		.attr("width", w + m[1] + m[3])
		.attr("height", h + m[0] + m[2])
	.select("g")
		.attr("transform", "translate(" + m[3] + "," + m[0] + ")");
	
	xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions);
	dimensions.forEach(function(d) {
	yscale[d].range([h, 0]);
	});

	d3.selectAll(".dimension")
	.attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
	// update brush placement
	d3.selectAll(".brush")
	.each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
	brush_count++;

	// update axis placement
	axis = axis.ticks(1+height/50),
	d3.selectAll(".axis")
	.each(function(d) { d3.select(this).call(axis.scale(yscale[d])); });

	// render data
	brush();
};



function remove_axis(d,g) {
	dimensions = _.difference(dimensions, [d]);
	xscale.domain(dimensions);
	g.attr("transform", function(p) { return "translate(" + position(p) + ")"; });
	g.filter(function(p) { return p == d; }).remove(); 
	update_ticks();
}



/**
 * BUTTONS
 */
// Appearance toggles
d3.select("#hide-ticks").on("click", hide_ticks);
d3.select("#show-ticks").on("click", show_ticks);
// clear all the selected movies
d3.select("#clear-selection").on("click", clear_selection);
// search box
d3.select("#search").on("keyup", brush);



function hide_ticks() {
	d3.selectAll(".axis g").style("display", "none");
	//d3.selectAll(".axis path").style("display", "none");
	d3.selectAll(".background").style("visibility", "hidden");
	d3.selectAll("#hide-ticks").attr("disabled", "disabled");
	d3.selectAll("#show-ticks").attr("disabled", null);
};

function show_ticks() {
	d3.selectAll(".axis g").style("display", null);
	//d3.selectAll(".axis path").style("display", null);
	d3.selectAll(".background").style("visibility", null);
	d3.selectAll("#show-ticks").attr("disabled", "disabled");
	d3.selectAll("#hide-ticks").attr("disabled", null);
};

function clear_selection(){
	selected_movie.forEach(function(item,index){
		unhighlight(item);
	});	
	selected_movie = [];
	d3.select("#search")[0][0].value = "";
	brush();
}


function search(selection,str) {
	pattern = new RegExp(str,"i")

	return _(selection).filter(function(d) {
		// PROBLEMA: um filme PODE ter 2 titulos [title, originalTitle]
		// Solucao: procurar o padrao nos 2 SE e SO SE tiver originalTitle
		// senao tiver titulo original ...
		if(d["originalTitle"] == 0)
			return pattern.exec(d["title"]); 
		else {
			// tenta encontrar padrao no titulo original
			var pattern_found = pattern.exec(d["originalTitle"]);
			if(pattern_found != null) return pattern_found;
			// caso contrario devolve o padrao encontrado no titulo
			return pattern.exec(d["title"]);
		}
	});
}

/**
 * @function merge_sample
 * description: merges the selected movies with the sample
 * of movies to be displayed in the data table
 * @param sample
 * @param selected
 * @return sample merged with the elements of the selected movies
 * in the first positions of the sample, so they come out on top
 */
function merge_sample(sample, selected) {
	// only works if array2 has less elements than array1...
	if(selected.length < selected.length) return array1;
	// 1st : Delete all elements on the sample
	// that are on the selected movies
	var i,j;
	for(i = 0; i < selected.length; i++)
		for(j = 0; j < sample.length; j++)
			if(selected[i] == sample[j])
				// removes the element in position j
				// all next elements positions are
				// decreased by 1
				sample.splice(j,1);
	// 2nd : Add all selected movies to the beginning
	// of the sample array
	for(i = 0; i < selected.length; i++)
		sample.splice(i,0,selected[i]);
	return sample;
}

/**
 * @function (PREDICATE) elementInArray
 * description: checks if element is in the array
 * parameters: element , array
 * @param element
 * @param array
 * @return true: if element is in the array , false: if not
 */
function elementInArray(element,array){
	var i;
	for(i = 0; i < array.length; i++){
		if(array[i] == element)
			return true;
	}
	return false;
}