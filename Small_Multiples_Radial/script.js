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
Domestic Profit (avg)
Worldwide Profit (avg)
Total Profit (avg)
*/ 
var nrAxis = 6;

/**
GENEROS PRINCIPAIS:
action
adventure
comedy
crime
drama
fantasy
horror
mystery
romance
sci-fi
thriller
other {
	animation
	biography
	documetary
	family
	history
	music
	musical
	short
	sport
	war
	western
}
*/

//Dados pa testar
var data = 	[
	{
      "title": "Airplane!",
      "originalTitle": "",
      "year": "1980",
      "rating": "7.8",
      "votes": "162.56",
      "votes_corrected": "162565",
      "genres/0": "Action",
      "genres/1": "",
      "genres/2": "",
      "genres/3": "",
      "genres/4": "",
      "genres/5": "",
      "ProductionBudget": "3500000",
      "DomesticGross": "83453539",
      "WorldwideGross": "83453539",
      "domesticProfit": "79953539",
      "worldwideProfit": "0",
      "totalProfit": "79953539"
    },
    {
      "title": "Caddyshack",
      "originalTitle": "",
      "year": "1980",
      "rating": "7.4",
      "votes": "82.65",
      "votes_corrected": "82648",
      "genres/0": "Comedy",
      "genres/1": "Action",
      "genres/2": "",
      "genres/3": "",
      "genres/4": "",
      "genres/5": "",
      "ProductionBudget": "6000000",
      "DomesticGross": "39846344",
      "WorldwideGross": "39846344",
      "domesticProfit": "33846344",
      "worldwideProfit": "0",
      "totalProfit": "33846344"
    },
    {
      "title": "Coal Miner's Daughter",
      "originalTitle": "",
      "year": "1980",
      "rating": "7.5",
      "votes": "13.09",
      "votes_corrected": "13087",
      "genres/0": "Biography",
      "genres/1": "Drama",
      "genres/2": "Music",
      "genres/3": "Musical",
      "genres/4": "Action",
      "genres/5": "",
      "ProductionBudget": "15000000",
      "DomesticGross": "67182787",
      "WorldwideGross": "67182787",
      "domesticProfit": "52182787",
      "worldwideProfit": "0",
      "totalProfit": "52182787"
    }
];

//Data Parse
var actionMovSel; //actionMoviesSelected
//data.forEach(selMovies(), extraParams = {paramGenre: "Action", paramTargetArray: actionMovSel})

/*
function selMovies(movie) {
	if (movie["genres/0"] == this.paramGenre || movie["genres/1"] == this.paramGenre || movie["genres/2"] == this.paramGenre
		|| movie["genres/3"] == this.paramGenre || movie["genres/4"] == this.paramGenre || movie["genres/5"] == this.paramGenre)
	this.paramTargetArray.push(movie);			
}
*/

//Input: data - array com filmes selecionados 
//		 genre - string para indicar o genero a filtrar
//Output: dados para colocar nos eixos
function calcSelMovieStats(data, genre) { //moviesSelected
	//Filter genre
	var movSel = [];

	for (i = 0; i = data.length; i++) {
		if (data[i]["genres/0"] == genre || data[i]["genres/1"] == genre || data[i]["genres/2"] == genre
			|| data[i]["genres/3"] == genre || data[i]["genres/4"] == genre || data[i]["genres/5"] == genre)
		movSel.push(movie);			
	}

	//Initialize
	var stats = [
					[
						{axis:"Rating (avg)",value:0}, //axis: atributo do genero
						{axis:"Votes (avg)",value:0},
						{axis:"Production Budget (avg)",value:0},
						{axis:"Domestic Profit (avg)",value:0},
						{axis:"Worldwide Profit (avg)",value:0},
						{axis:"Total Profit (avg)",value:0}
					]
				]

	//Add
	for (i = 0; i = movSel.length; i++)
		for (j = 0; j = nrAxis; j++)
			stats[j].value += movSel[i][j].value; 

	//Divide
	for (j = 0; j = nrAxis; j++)
			stats[j].value = stats[j].value / movSel.length; 

	//Return average :D
	return stats;
} 

var d = calcSelMovieStats(data, "Action");
console.log(d);

//Data
/*
var d = [
		  [
			{axis:"Rating (avg)",value:0.59}, //axis: atributo do genero
			{axis:"Votes (avg)",value:0.56},
			{axis:"Production Budget (avg)",value:0.42},
			{axis:"Domestic Profit (avg)",value:0.14},
			{axis:"Worldwide Profit (avg)",value:0.11},
			{axis:"Total Profit (avg)",value:0.05}
		  ]
		];
*/
/*
var comedyData = [
		  [
			{axis:"Rating (avg)",value:0.59}, //axis: atributo do genero
			{axis:"Votes (avg)",value:0.56},
			{axis:"Production Budget (avg)",value:0.42},
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