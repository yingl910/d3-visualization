var full_data = [
	{state:"Alabama",life_expectancy:75.4,poverty_rate:22,region:"South"},
	{state:"Alaska",life_expectancy:78.3,poverty_rate:21,region:"Other"},
	{state:"Arizona",life_expectancy:79.6,poverty_rate:23,region:"West"},
	{state:"Arkansas",life_expectancy:76,poverty_rate:22,region:"South"},
	{state:"California",life_expectancy:80.8,poverty_rate:24,region:"West"},
	{state:"Colorado",life_expectancy:80,poverty_rate:16,region:"West"},
	{state:"Connecticut",life_expectancy:80.8,poverty_rate:14,region:"Northeast"},
	{state:"Delaware",life_expectancy:78.4,poverty_rate:17,region:"Northeast"},
	{state:"District of Columbia",life_expectancy:76.5,poverty_rate:25,region:"South"},
	{state:"Florida",life_expectancy:79.4,poverty_rate:20,region:"South"},
	{state:"Georgia",life_expectancy:77.2,poverty_rate:23,region:"South"},
	{state:"Hawaii",life_expectancy:81.3,poverty_rate:24,region:"Other"},
	{state:"Idaho",life_expectancy:79.5,poverty_rate:19,region:"West"},
	{state:"Illinois",life_expectancy:79,poverty_rate:19,region:"Midwest"},
	{state:"Indiana",life_expectancy:77.6,poverty_rate:20,region:"Midwest"},
	{state:"Iowa",life_expectancy:79.7,poverty_rate:14,region:"Midwest"},
	{state:"Kansas",life_expectancy:78.7,poverty_rate:17,region:"Midwest"},
	{state:"Kentucky",life_expectancy:76,poverty_rate:22,region:"South"},
	{state:"Louisiana",life_expectancy:75.7,poverty_rate:27,region:"South"},
	{state:"Maine",life_expectancy:79.2,poverty_rate:16,region:"Northeast"},
	{state:"Maryland",life_expectancy:78.8,poverty_rate:16,region:"Northeast"},
	{state:"Massachusetts",life_expectancy:80.5,poverty_rate:15,region:"Northeast"},
	{state:"Michigan",life_expectancy:78.2,poverty_rate:20,region:"Midwest"},
	{state:"Minnesota",life_expectancy:81.1,poverty_rate:13,region:"Midwest"},
	{state:"Mississippi",life_expectancy:75,poverty_rate:25,region:"South"},
	{state:"Missouri",life_expectancy:77.5,poverty_rate:19,region:"Midwest"},
	{state:"Montana",life_expectancy:78.5,poverty_rate:19,region:"West"},
	{state:"Nebraska",life_expectancy:79.8,poverty_rate:14,region:"Midwest"},
	{state:"Nevada",life_expectancy:78.1,poverty_rate:21,region:"West"},
	{state:"New Hampshire",life_expectancy:80.3,poverty_rate:10,region:"Northeast"},
	{state:"New Jersey",life_expectancy:80.3,poverty_rate:17,region:"Northeast"},
	{state:"New Mexico",life_expectancy:78.4,poverty_rate:27,region:"West"},
	{state:"New York",life_expectancy:80.5,poverty_rate:22,region:"Northeast"},
	{state:"North Carolina",life_expectancy:77.8,poverty_rate:21,region:"South"},
	{state:"North Dakota",life_expectancy:79.5,poverty_rate:14,region:"Midwest"},
	{state:"Ohio",life_expectancy:77.8,poverty_rate:20,region:"Midwest"},
	{state:"Oklahoma",life_expectancy:75.9,poverty_rate:19,region:"South"},
	{state:"Oregon",life_expectancy:79.5,poverty_rate:19,region:"West"},
	{state:"Pennsylvania",life_expectancy:78.5,poverty_rate:17,region:"Northeast"},
	{state:"Rhode Island",life_expectancy:79.9,poverty_rate:18,region:"Northeast"},
	{state:"South Carolina",life_expectancy:77,poverty_rate:24,region:"South"},
	{state:"South Dakota",life_expectancy:79.5,poverty_rate:17,region:"Midwest"},
	{state:"Tennessee",life_expectancy:76.3,poverty_rate:21,region:"South"},
	{state:"Texas",life_expectancy:78.5,poverty_rate:23,region:"South"},
	{state:"Utah",life_expectancy:80.2,poverty_rate:16,region:"West"},
	{state:"Vermont",life_expectancy:80.5,poverty_rate:14,region:"Northeast"},
	{state:"Virginia",life_expectancy:79,poverty_rate:16,region:"South"},
	{state:"Washington",life_expectancy:79.9,poverty_rate:16,region:"West"},
	{state:"West Virginia",life_expectancy:75.4,poverty_rate:21,region:"South"},
	{state:"Wisconsin",life_expectancy:80,poverty_rate:15,region:"Midwest"},
	{state:"Wyoming",life_expectancy:78.3,poverty_rate:14,region:"West"}
];

var life_expectancy = full_data.map(function(d) {return d.life_expectancy});
var poverty_rate = full_data.map(function(d) {return d.poverty_rate});

//split data into training and test data based on the region
var training_data = full_data.filter(function(d) {return ((d.region=="Northeast") || (d.region=="South")); });
var test_data = full_data.filter(function(d) {return ((d.region!="Northeast") && (d.region!="South")); });

training_data = training_data.map(function(d) { return expand(d, life_expectancy, poverty_rate); });
test_data = test_data.map(function(d) { return expand(d, life_expectancy, poverty_rate); });

//create the classifier and train it with all items in the training set
var classifier = new ss.bayesian();
training_data.forEach(
	function(d) {
		classifier.train({
			life_exp: d.life_expectancy_cat,
			pov_rate: d.poverty_rate_cat
		},d.region);
	}
);


//use the classifier to label each item in the test set for one of the two classes: Northeast and South
test_data.forEach(
	function(d) {
		var prob_vec = classifier.score({
			life_exp: d.life_expectancy_cat,
			pov_rate: d.poverty_rate_cat
		});

		if (prob_vec.Northeast > prob_vec.South) {
			d.label = "Northeast";
		}
		else if (prob_vec.Northeast < prob_vec.South) {
			d.label = "South";
		}
		else {
			d.label = "Unknown";
		}
	}
);

var svg;
var height = 500;
var width = 500;
var margin = 40;
var region_color = d3.scaleOrdinal(d3.schemeCategory10);
var x = d3.scaleLinear()
	.domain([0,30])
	.range([margin,width-margin]);

var y = d3.scaleLinear()
	.domain([90,70])
	.range([margin,height-margin]);

//initial visualization
function initVis() {

	svg = d3.select("#vis_container")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	//x axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0,"+(500-margin)+")")
		.call(d3.axisBottom(x));

	svg.append("text")
		.attr("class", "axis-label")
		.attr("y", 495)
		.attr("x",0 + (500 / 2))
		.style("text-anchor", "middle")
		.text("Poverty Rate");

	// y axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+margin+",0)")
		.call(d3.axisLeft(y));

	svg.append("text")
		.attr("transform", "rotate(90)")
		.attr("class", "axis-label")
		.attr("y", -5)
		.attr("x",0 + (500 / 2))
		.style("text-anchor", "middle")
		.text("Life Expectancy");

	//make training data transparent and draw them on the canvas
	var circles = svg.selectAll(".baseline").data(training_data, function(d) {return d.state;});

	circles.enter().append("circle")
		.attr("class", "baseline")
		.attr("r", 4)
		.attr("cx", function(d) { return x(d.poverty_rate); })
		.attr("cy", function(d) { return y(d.life_expectancy); })
		.style("stroke", function(d) { return region_color(d.region); })
		.style("fill", function(d) { return region_color(d.region); })
		.style("fill-opacity", "0.1")
		.style("stroke-width", 1)
		.style("stroke-opacity", "0.2")
		.on("mouseover", function(){ document.getElementById("details").innerHTML = this.__data__.state + " has a life expectancy of " + this.__data__.life_expectancy + " and a poverty rate of " + this.__data__.poverty_rate + "%."; })
		.on("mouseout", function(){ document.getElementById("details").innerHTML = " "; });
}

//render visualization function
function renderVis(_subset) {
	var data_subset = test_data;
	if (_subset == "none") {
		data_subset = [];
	}
	else if (_subset != "us") {
		data_subset = test_data.filter(function(d) {return (d.label == _subset); });
	}

	var circles = svg.selectAll(".label").data(data_subset, function(d) {return d.state;});

	circles.exit()
		.transition()
		.duration(250)
		.attr("r",0)
		.remove();

	circles.enter().append("circle")
		.attr("class", "label")
		.attr("r", 0)
		.attr("cx", function(d) { return x(d.poverty_rate); })
		.attr("cy", function(d) { return y(d.life_expectancy); })
		.style("fill", function(d) { return region_color(d.label); })
		.on("mouseover", function(){ document.getElementById("details").innerHTML = this.__data__.state + " has a life expectancy of " + this.__data__.life_expectancy + " and a poverty rate of " + this.__data__.poverty_rate + "%."; })
		.on("mouseout", function(){ document.getElementById("details").innerHTML = " "; })
		.transition()
		.duration(750)
		.attr("r",5)
}

//get the life_expectancy and poverty_rate category
function expand(d, life_expectancy, poverty_rate) {

	if (d.life_expectancy < ss.quantile(life_expectancy, 0.33)) {
		d.life_expectancy_cat = "low";
	}
	else if (d.life_expectancy > ss.quantile(life_expectancy, 0.67)) {
		d.life_expectancy_cat = "high";
	}
	else {
		d.life_expectancy_cat = "med";
	}

	if (d.poverty_rate < ss.quantile(poverty_rate, 0.33)) {
		d.poverty_rate_cat = "low";
	}
	else if (d.poverty_rate > ss.quantile(poverty_rate, 0.67)) {
		d.poverty_rate_cat = "high";
	}
	else {
		d.poverty_rate_cat = "med";
	}

	return d;
}