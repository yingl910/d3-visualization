var p_threshold = 0.01;
var width = 150;
var height = 150;
var margin_x = 20;
var margin_y = 20;

function produceAndPositionScatterPlot(data1, data2, field1, field2) {
	var corr_coef = ss.sampleCorrelation(data1, data2);
	var p = getPforR(corr_coef, data1.length);

	var container_id = "#";
	if (p<p_threshold) {
		container_id += "significant";
	}
	else {
		container_id += "insignificant";
	}

	//create an SVG element in the right div
	var svg = d3.select(container_id).append("svg")
		.attr("width", width + 2* margin_x)
		.attr("height", height + 2* margin_y);

	renderScatterplot(svg, field1, data1, field2, data2);
}

function renderScatterplot(svg, field1, data1, field2, data2) {
	var x = d3.scaleLinear()
		.domain([ss.min(data1), ss.max(data1)])
		.range([0, width]);

	var y = d3.scaleLinear()
		.domain([ss.min(data2), ss.max(data2)])
		.range([height, 0]);

	var g = svg.append("g")
		.attr("transform", "translate("+margin_x+","+margin_y+")");

	g.append("rect")
		.attr("class", "plotbg")
		.attr("x", 0)
		.attr("y", 0)
		.attr("height", height)
		.attr("width", width);

	//quantiles
	g.append("rect")
		.attr("class", "quantile")
		.attr("y", 0)
		.attr("height", height)
		.attr("x", x(ss.quantile(data1, 0.25)))
		.attr("width", x(ss.quantile(data1, 0.75)) - x(ss.quantile(data1, 0.25)));

	g.append("rect")
		.attr("class", "quantile")
		.attr("x", 0)
		.attr("width", width)
		.attr("y", y(ss.quantile(data2, 0.75)))
		.attr("height", y(ss.quantile(data2, 0.25)) - y(ss.quantile(data2, 0.75)));

	//zip the data and draw the circles
	var zipped_data = d3.zip(data1, data2);

	g.selectAll(".dot").data(zipped_data).enter().append("circle")
		.attr("class", "dot")
		.attr("cx", function(d) {return x(d[0]);})
		.attr("cy", function(d) {return y(d[1]);})
		.attr("r", 2);

	//calculate R2
	var linear_model = ss.linearRegressionLine(ss.linearRegression(zipped_data));
	var r_squared = ss.rSquared(zipped_data, linear_model);

	console.log(r_squared);

	//labeling the charts
	//1: "R Squared" labels
	g.append("text")
		.attr("class", "label")
		.attr("x", 0)
		.attr("y", 0)
		.attr("dy", "-0.3em")
		.text("R2: " + r_squared.toFixed(2));

	//2: X axis labels
	g.append("text")
		.attr("class", "label")
		.attr("x", 0)
		.attr("y", height)
		.attr("dy", "1em")
		.text(ss.min(data1).toFixed(1));
	g.append("text")
		.attr("class", "label")
		.attr("x", width/2)
		.attr("y", height)
		.attr("dy", "1em")
		.attr("text-anchor","middle")
		.text(field1);
	g.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", height)
		.attr("dy", "1em")
		.attr("text-anchor","end")
		.text(ss.max(data1).toFixed(1));

	//3: Y axis labels
	g.append("text")
		.attr("transform", "rotate(90, 0, 0)")
		.attr("class", "label")
		.attr("x", 0)
		.attr("y", 0)
		.attr("dy", "1em")
		.text(ss.max(data2).toFixed(1));
	g.append("text")
		.attr("transform", "rotate(90, 0, 0)")
		.attr("class", "label")
		.attr("x", width/2)
		.attr("y", 0)
		.attr("dy", "1em")
		.attr("text-anchor","middle")
		.text(field2);
	g.append("text")
		.attr("transform", "rotate(90, 0, 0)")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", 0)
		.attr("dy", "1em")
		.attr("text-anchor","end")
		.text(ss.min(data2).toFixed(1));
}