// var width = 1080,
// height = 500;

// margins
var margin = {top: 0, right: 10, bottom: 0, left: 85},
    width = 900 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var projection = d3.geoEquirectangular()
    .center([-72, 43])
    .rotate([4.0, 1])
    .scale(4000)
    .translate([width/1.25, -250]);

var path = d3.geoPath()
    .projection(projection);

// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height);

 // create responsive svg
var svg = d3.select("#ncmap")
   .append("div")
   .classed("svg-container1", true) //container class to make it responsive
   .append("svg")
   .attr("preserveAspectRatio", "xMinYMin meet") //responsive SVG needs these 2 attributes and no width and height attr
   .attr("viewBox", "-10 170 650 220") //class to make it responsive /left/bottom/
   .classed("svg-content-responsive", true);


function renderVis(year, resource, selectedCounty) {

    var csv_file;
    if (resource === "dv") {
        switch(year) {
            case "2015":
                csv_file = "data/dv-services-2015-16.csv"
                break;
            case "2014":
                csv_file = "data/dv-services-2014-15.csv"
                break;
            case "2013":
                csv_file = "data/dv-services-2013-14.csv"
                break;
            case "2012":
                csv_file = "data/dv-services-2012-13.csv"
                break;
            case "2011":
                csv_file = "data/dv-services-2011-12.csv"
                break;
            case "2010":
                csv_file = "data/dv-services-2010-11.csv"
                break;
            case "2009":
                csv_file = "data/dv-services-2009-10.csv"
                break;
            case "2008":
                csv_file = "data/dv-services-2008-09.csv"
                break;
        }
    }
    else {
        switch(year) {
            case "2015":
                csv_file = "data/sa-services-2015-16.csv"
                break;
            case "2014":
                csv_file = "data/sa-services-2014-15.csv"
                break;
            case "2013":
                csv_file = "data/sa-services-2013-14.csv"
                break;
            case "2012":
                csv_file = "data/sa-services-2012-13.csv"
                break;
            case "2011":
                csv_file = "data/sa-services-2011-12.csv"
                break;
            case "2010":
                csv_file = "data/sa-services-2010-11.csv"
                break;
            case "2009":
                csv_file = "data/sa-services-2009-10.csv"
                break;
            case "2008":
                csv_file = "data/sa-services-2008-09.csv"
                break;
        }
    }


    d3.json("js/nc.json", function(nc) {
            var nc_data = topojson.feature(nc, nc.objects.ncgeo).features;
    var csv_data;
    d3.csv(csv_file, function(data) {
        data.forEach(function(d) {
            csv_data = data;
        });
    csv_data[40].County = "Guilford"

    var max_color = d3.max(csv_data, function(d) {return d.Total;});
    var min_color = d3.min(csv_data, function(d) {return d.Total;});
    // if (resource === "dv")
    var colorScale = d3.scaleLinear().domain([0, 0.14]).range(["#f1ebf2", "#7c407f"]);
    // else
    //   var colorScale = d3.scale.linear().domain([0, 0.04]).range(["#f1ebf2", "#7c407f"]);
    //console.log(max_color);
    nc_data.forEach(function(data){
        var current = csv_data.filter(function(data2) {
            if (data2.County === data.properties.name)
                return true;
            else
                return false;
        });

        if (current.length > 0){
            data.properties.total = current[0].Total;
            data.properties.services = current[0].Services;
            data.properties.information = current[0].Information;
            data.properties.advocacy = current[0].Advocacy;
            data.properties.referral = current[0].Referral;
            data.properties.transportation = current[0].Transportation;
            data.properties.counseling = current[0].Counseling;
            data.properties.hospital = current[0].Hospital;
            data.properties.court = current[0].Court;
            data.properties.other = current[0].Other;
        }
        else {
            data.properties.total = "Not Reported";
            data.properties.services = "Not Reported";
            data.properties.information = "Not Reported";
            data.properties.advocacy = "Not Reported";
            data.properties.referral = "Not Reported";
            data.properties.transportation = "Not Reported";
            data.properties.counseling = "Not Reported";
            data.properties.hospital = "Not Reported";
            data.properties.court = "Not Reported";
            data.properties.other = "Not Reported";
        }
    });

    var map = svg.selectAll(".subunit")
        .data(nc_data)
    .enter().append("path")
        .attr("d", path )
        .style("fill", function(d) { if (d.properties.total === "Not Reported") {return colorScale(0);} else if (d.properties.name === selectedCounty) {return "#ffb62b";} else {return colorScale(d.properties.total);}})
        .attr("opacity", function(d) { if (d.properties.name === selectedCounty) {return 1;} else {return 1} })
        .style("stroke", "white")
        .style("stroke-width", 1.25);

    map.on("mouseover", function(d) {
        d3.select(this).attr("d",path).style("fill", "#ffb62b").style("opacity", 1);
        var bodyNode = d3.select('body').node();
        var absoluteMousePos = d3.mouse(bodyNode);
        div.transition()
           .duration(200)
           .style("opacity", .9);
        //console.log(d.properties.total)
        div.html(d.properties.name + "<br>" + d.properties.total)
           .style("left", (absoluteMousePos[0] + 30)+'px')
           .style("top", (absoluteMousePos[1] - 15)+'px')
           .style("postition","absolute");
        var details =
            " <b>County:</b> " + d.properties.name +
            "<br>" +
            " <b>Information Services:</b> " + d.properties.information +
            "<br>" +
            " <b>Advocacy Services:</b> " + d.properties.advocacy +
            "<br>" +
            " <b>Referral Services:</b> " + d.properties.referral +
            "<br>" +
            " <b>Transportation Services:</b> " + d.properties.transportation +
            "<br>" +
            " <b>Counseling Services:</b> " + d.properties.counseling +
            "<br>" +
            " <b>Hospital Services:</b> " + d.properties.hospital +
            "<br>" +
            " <b>Court Services:</b> " + d.properties.court;

        document.getElementById("details").innerHTML = details;
    })

    .on("mousemove", function(d) {
        var bodyNode = d3.select('body').node();
        var absoluteMousePos = d3.mouse(bodyNode);
        div.html(d.properties.name + "<br>" + d.properties.services)
        .style("left", (absoluteMousePos[0] + 30)+'px')
        .style("top", (absoluteMousePos[1] - 15)+'px')
        .style("postition","absolute");
        })

    .on("mouseout", function(d) {
        d3.select(this).attr("d",path).style("fill",function(d) { if (d.properties.total === "Not Reported") {return colorScale(0);} else if (d.properties.name === selectedCounty) {return "#ffb62b";} else {return colorScale(d.properties.total);}}).style("opacity",function(d) { if (d.properties.name === selectedCounty) {return 1;} else {return 1;}});
        div.transition()
            .duration(500)
            .style("opacity", 0);
        });

    });
});
};

var year, resource, selectedCounty;

function changeYear(input_year) {
    year = input_year;
    renderVis(year, resource, selectCounty);
}

function changeResource(input_resource) {
    resource = input_resource;
    renderVis(year, resource, selectCounty);
}

function selectCounty(input_county) {
    selectedCounty = input_county;
    renderVis(year, resource, selectedCounty);
}

year = "2015", resource = "dv"; selectedCounty = "none"
renderVis(year, resource, selectedCounty);
