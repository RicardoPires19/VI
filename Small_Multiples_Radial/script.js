var w = 100,
	h = 100;

var colorscale = d3.scale.category10();

//Legend titles - nome do genre - provavelmente melhor substituir por titulo por cima do mini radar 
var LegendOptions = ['Action'];

/* == Radial Chart ==
Attributes to show for each genre:
Rating (avg)
Votes (avg)
Production Budget (avg)
Domestic Gross (avg)
Worldwide Gross (avg)
Domestic Profit (avg)
Worldwide Profit (avg)
Total Profit (avg)
*/ 

//Data
var d = [
		  [
			{axis:"Rating (avg)",value:0.59}, //axis: atributo do genero
			{axis:"Votes (avg)",value:0.56},
			{axis:"Production Budget (avg)",value:0.42},
			{axis:"Domestic Gross (avg)",value:0.34},
			{axis:"Worldwide Gross (avg)",value:0.48},
			{axis:"Domestic Profit (avg)",value:0.14},
			{axis:"Worldwide Profit (avg)",value:0.11},
			{axis:"Total Profit (avg)",value:0.05},
		  ]
		];
/*
var comedyData = [
		  [
			{axis:"Rating (avg)",value:0.59}, //axis: atributo do genero
			{axis:"Votes (avg)",value:0.56},
			{axis:"Production Budget (avg)",value:0.42},
			{axis:"Domestic Gross (avg)",value:0.34},
			{axis:"Worldwide Gross (avg)",value:0.48},
			{axis:"Domestic Profit (avg)",value:0.14},
			{axis:"Worldwide Profit (avg)",value:0.11},
			{axis:"Total Profit (avg)",value:0.05},
		  ]
		];
*/
//Options para cada um dos mini radar charts
var mycfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300,
  TranslateX: 110, //radar center coordinate
  TranslateY: 30 //radar center coordinate
}
/*
var comedyRadarCgf = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300
  TranslateX: 400, //radar center coordinate
  TranslateY: 30, //radar center coordinate
}
*/

//Call function to draw the Radar chart
//Will expect that data is in %'s
RadarChart.draw("#chart", d, mycfg);

//RadarChart.draw("#comedyChart", comedyData, comedyRadarCgf);

////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

var svg = d3.select('#body')
	.selectAll('svg')
	.append('svg')
	.attr("width", w+300)
	.attr("height", h)

//Create the title for the legend
var text = svg.append("text")
	.attr("class", "title")
	.attr('transform', 'translate(90,0)') 
	.attr("x", w - 45)
	.attr("y", 10)
	.attr("font-size", "12px")
	.attr("fill", "#404040")
	.text("Action");	