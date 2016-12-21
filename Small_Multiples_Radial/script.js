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
      "genres/1": "Comedy",
      "genres/2": "Adventure",
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
      "genres/2": "Adventure",
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
      "genres/0": "Adventure",
      "genres/1": "Drama",
      "genres/2": "Music",
      "genres/3": "Musical",
      "genres/4": "Action",
      "genres/5": "Comedy",
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

//Input: data - array com filmes selecionados 
//		 genre - string para indicar o genero a filtrar
//Output: dados para colocar nos eixos
function calcSelMovieStats(data, genre) { //moviesSelected
	//Filter genre
	var movSel = [];
	for (i = 0; i < data.length; i++) {
		if (data[i]["genres/0"] == genre || 
			data[i]["genres/1"] == genre || 
			data[i]["genres/2"] == genre ||
			data[i]["genres/3"] == genre || 
			data[i]["genres/4"] == genre || 
			data[i]["genres/5"] == genre)
		movSel.push(data[i]);			
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
				];

	//Add
	for (i = 0; i < movSel.length; i++) {
		stats[0][0].value += parseFloat(movSel[i]["rating"]); 
		stats[0][1].value += parseFloat(movSel[i]["votes"]);
		stats[0][2].value += parseFloat(movSel[i]["ProductionBudget"]);
		stats[0][3].value += parseFloat(movSel[i]["domesticProfit"]);
		stats[0][4].value += parseFloat(movSel[i]["worldwideProfit"]);
		stats[0][5].value += parseFloat(movSel[i]["totalProfit"]);
	}

	//Divide
	for (j = 0; j < nrAxis; j++)
			stats[0][j].value = stats[0][j].value / movSel.length; 

	//Return average :D
	return stats;
} 

var actionData = calcSelMovieStats(data, "Action");
var adventureData = calcSelMovieStats(data, "Adventure");
var comedyData = calcSelMovieStats(data, "Comedy");

//Options para cada um dos mini radar charts
var actionRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300,
  TranslateX: 110, //radar center coordinate
  TranslateY: 30, //radar center coordinate
  title: "Action",
  htmlID: "#actionChart"
}

var adventureRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 2000,
  ExtraWidthY: 2000,
  TranslateX: 800, //radar center coordinate
  TranslateY: 130, //radar center coordinate
  title: "Adventure",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#adventureChart"
}

var comedyRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var crimeRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var dramaRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var fantasyRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var horrorRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var mysteryRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var romanceRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var scifiRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}

var thrillerRadarCfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 1000,
  ExtraWidthY: 1000,
  TranslateX: 500, //radar center coordinate
  TranslateY: 80, //radar center coordinate
  title: "Comedy",
  showAxisName: false,
  color: d3.rgb("red"),
  htmlID: "#comedyChart"
}


//Call function to draw the Radar chart
//Will expect that data is in %'s
RadarChart.draw("#actionChart", actionData, actionRadarCfg);
RadarChart.draw("#adventureChart", adventureData, adventureRadarCfg);
RadarChart.draw("#comedyChart", comedyData, comedyRadarCfg);

/*
crime
drama
fantasy
horror
mystery
romance
sci-fi
thriller
*/