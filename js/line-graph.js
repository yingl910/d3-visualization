var margin = {top: 20, right: 55, bottom: 30, left: 60},
    width  = 800 - margin.left - margin.right,
    height = 400  - margin.top  - margin.bottom;

var x = d3.scaleBand()
    .rangeRound([0, width], .1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y);

var line = d3.line()
    .x(function (d) { return x(d.year) + margin.left/2; })
    .y(function (d) { return y(d.value); });

var color = d3.scaleOrdinal()
    .domain(["sa", "dv"])
    .range(["#5c315e","#a379a5"]);

// var svg = d3.select("body").append("svg")
//     .attr("width",  width  + margin.left + margin.right)
//     .attr("height", height + margin.top  + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// set up and create responsive svg
var svg2 = d3.select("#linegraph")
  .append("div")
   //container class to make it responsive
  .classed("svg-container", true)
  .append("svg")
  //responsive SVG needs these 2 attributes and no width and height attr
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("id", "line-chart")
  //class to make it responsive /size/bottom/
  .attr("viewBox", "-50 -25 800 900")
  .classed("svg-content-responsive", true);

  // Add x axis
  svg2.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")

  // Add x axis label
  svg2.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Fiscal Year");

  // Add Y axis
  svg2.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", ".71em")
  .style("text-anchor", "end")
  .text("Number of Clients");

  // Add y-axis label
  svg2.append("text")
      .attr("class", "y label")
      .attr("text-anchor", "end")
      .attr("y", 6)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("Number of Clients");


function lineChange(linegraphs) {


d3.csv("data/data-clients.csv", function (error, data) {

    var years = [];
    var sexual_assault = [];
    var domestic_violence = [];
    var point_data = [];
    var dv_all = [];
    var sa_all = [];
    data.forEach(function(d,i) {
        years[i] = d.Year;
        sexual_assault[i] = parseInt(d.SA);
        domestic_violence[i] = parseInt(d.DV);
        point_data[2*i] = {"year": d.Year, "type": "dv", "value": d.DV};
        dv_all[i] = point_data[2*i];
        point_data[2*i + 1] = {"year": d.Year, "type": "sa", "value": d.SA};
        sa_all[i] = point_data[2*i + 1];
    });

    var line_data = [{"type": "sa", "values": sa_all}, {"type": "dv", "values": dv_all }];

    var all_values = sexual_assault.concat(domestic_violence)

    x.domain(years);

    if (linegraphs === "both") {
       y.domain([0, d3.max(domestic_violence)]);
    }
    else if (linegraphs === "sa") {
       y.domain([0, d3.max(sexual_assault)]);
    }
    else {
       y.domain([0, d3.max(domestic_violence)]);
    }

    svg2.selectAll("g.x.axis")
       .call(xAxis);
    svg2.selectAll("g.y.axis")
       .call(yAxis);

    var circles = svg2.selectAll("circle")
       .data(point_data.filter(function(d) {
            if (linegraphs == "both") {
                return d;
            }
            else {
                return d.type == linegraphs;
            }
        }));

    circles.enter().append("circle")
       .merge(circles)
       .attr("fill", function (d) { return color(d.type); })
       .attr("cx", function (d) { return x(d.year) + margin.left/2; })
       .attr("cy", function (d) { return y(d.value); })
       .attr("r", 0)

       .attr("r", 5)
       .on("mouseover", function (d) { var bodyNode = d3.select('body').node();
           var absoluteMousePos = d3.mouse(bodyNode); showPopover.call(this, d); $('.popover')[0].style.top = (absoluteMousePos[1] - 105) + 'px';  })
       .on("mouseout",  function (d) { removePopovers(); });


    circles.exit().attr("r",0).remove();

    var lines = svg2.selectAll("path.line")
       .data(line_data.filter(function(d) { if (linegraphs === "both") return d; else return d.type === linegraphs }));

    lines.enter().append("path")
       .attr("class", "line")
       .merge(lines)
       .attr("d", function (d) { return line(d.values); })
       .style("stroke", function (d) { return color(d.type); })
       .style("fill", "none")
       .style("stroke-width", "0px")
       .style("stroke-width", "3px");

    lines.exit().style("stroke-width", "0px").remove();

    function removePopovers () {
       $('.popover').each(function() {
            $(this).remove();
        });
    }

    function showPopover (d) {
       $(this).popover({
            title: function() {if (d.type == "sa") return "Sexual Assault"; else return "Domestic Violence";},
            placement: 'auto top',
            container: 'body',
            trigger: 'manual',
            html : true,
            content: function() {
            return "Year: " + d.year +
            "<br/>Clients: " + d3.format(",")(d.value ? d.value: d.y1 - d.y0); }
            });
       $(this).popover('show')
    }


})

};

lineChange("both");
