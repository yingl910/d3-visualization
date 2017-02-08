var dv_data = [
    {year:'2004-2005',hotline:104063,service:293739,support_group:12854},
    {year:'2005-2006',hotline:115124,service:404508,support_group:12826},
    {year:'2006-2007',hotline:119348,service:402874,support_group:12568},
    {year:'2007-2008',hotline:101076,service:403544,support_group:10379},
    {year:'2008-2009',hotline:126016,service:461277,support_group:12970},
    {year:'2009-2010',hotline:120666,service:470078,support_group:15994},
    {year:'2010-2011',hotline:95877,service:478400,support_group:13804},
    {year:'2011-2012',hotline:84075,service:394083,support_group:10626},
    {year:'2012-2013',hotline:114034,service:444425,support_group:11515},
    {year:'2013-2014',hotline:116052,service:465463,support_group:10920},
    {year:'2014-2015',hotline:110319,service:504810,support_group:11222},
    {year:'2015-2016',hotline:101940,service:513088,support_group:9197}

]
var sa_data = [
    {year:'2004-2005',hotline:20680,service:66774,support_group:2474},
    {year:'2005-2006',hotline:25849,service:88954,support_group:2862},
    {year:'2006-2007',hotline:25756,service:100284,support_group:2756},
    {year:'2007-2008',hotline:22671,service:87818,support_group:2086},
    {year:'2008-2009',hotline:20984,service:105142,support_group:2232},
    {year:'2009-2010',hotline:22141,service:116147,support_group:3016},
    {year:'2010-2011',hotline:25058,service:119282,support_group:3565},
    {year:'2011-2012',hotline:23002,service:120212,support_group:3038},
    {year:'2012-2013',hotline:20763,service:118111,support_group:3182},
    {year:'2013-2014',hotline:22031,service:109313,support_group:3238},
    {year:'2014-2015',hotline:24356,service:118330,support_group:2923},
    {year:'2015-2016',hotline:20681,service:123001,support_group:3078}
]

var margin = {top: 30, right: 70, bottom: 30, left: 80},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var y = d3.scaleLinear().rangeRound([height, 0]);
var color = d3.scaleOrdinal()
    .range(["#5c315e","#89538b","#cb9fd9"]);

function Vis() {

    this.program = 'dv';
    this.show_mode = 'all';

    this.setProgram = function (program) {
        this.program = program;
        this.render();
    }

    this.setShow = function (show_mode) {
        this.show_mode = show_mode;
        this.render();
    }

    this.render = function () {
        $("#vis_canvas").empty();
        var program = this.program;
        var show_mode = this.show_mode;

        var text = document.getElementById(show_mode).innerHTML + " Provided in "+ document.getElementById(program).innerHTML +" Program from 2004 to 2016";
        document.getElementById("barChart").innerHTML = text;

        if(program == 'dv'){
            data = dv_data;
        }
        else if(program == 'sa'){
            data = sa_data;
        }

        var labelVar = 'year';
        var varNames = d3.keys(data[0]).slice(1,4);
        console.log(d3.keys(data[0]));
        if(show_mode == 'hotline'){
            varNames = varNames.slice(0,1);
        }
        else if(show_mode == 'service'){
            varNames = varNames.slice(1,2);
        }
        else if(show_mode == 'support_group'){
            varNames = varNames.slice(2,3);
        }

        data.forEach(function (d) {
            var y0 = 0;
            d.mapping = varNames.map(function(name) {
                return {
                        name: name,
                        label: d[labelVar],
                        y0: y0,
                        y1: y0 += +d[name]
                    };
            });
            d.total = d.mapping[d.mapping.length - 1].y1;
        });

        // var svg3 = d3.select("#vis_canvas").append("svg")
        //     .attr("width", width + margin.left + margin.right)
        //     .attr("height", height + margin.top + margin.bottom)
        //     .append("g")
        //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // set up and create responsive svg
        var svg3 = d3.select("#vis_canvas")
          .append("div")
           //container class to make it responsive
          .classed("svg-container", true)
          .append("svg")
          //responsive SVG needs these 2 attributes and no width and height attr
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("id", "")
          //class to make it responsive /size/bottom/
          .attr("viewBox", "-50 0 900 2000")
          .classed("svg-content-responsive", true);

            y.domain([0, 626351])
            if(program == 'sa'){
             y.domain([0,147905])
             }
            x.domain(data.map(function (d) {
                return d.year;
            }));

        // Create x axis
        svg3.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // svg3.append("text")
        //         .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
        //         .style("text-anchor", "middle")
        //         .text("Fiscal Year");

        // create y axis
        svg3.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(y).ticks(10, "s"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of Services");

        // create y axis label
        svg3.append("text")
           .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Number of Services");

        var selection = svg3.selectAll(".series")
            .data(data)
            .enter().append("g")
            .attr("class", "series")
            .attr("transform", function(d){ return "translate(" + x(d.year) + ",0)"; });
        var bar = selection.selectAll("rect").data(function (d) {
            return d.mapping;
        })

        bar.enter().append("rect")
            .attr("x",function(d){
                return d.year;
            })
            .attr("width", x.bandwidth())
            .attr("y", function (d) {
                return y(d.y1);
            })
            .attr("height", function (d) {
                return y(d.y0) - y(d.y1);
            })
            .style("fill", function (d) {
                return color(d.name);
            })
            .style("stroke", "white")
            .on("mouseover", function (d) {
                d3.select(this).style("fill", "#ffb62b");
                showPopover.call(this, d);
            })
            .on("mouseout", function (d) {
                removePopovers();
                d3.select(this).style("fill", function (d) {
                    return color(d.name);
                });
            })

        var legend = svg3.selectAll(".legend")
                .data(varNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(100," + i * 20 + ")";
                });
        legend.append("rect")
                .attr("x", width + 1 )
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", color)
                .style("stroke", "grey");
        legend.append("text")
                .attr("x", width - 5)
                .attr("y", 6)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) {
                    return d;
                });

        function removePopovers() {
                $('.popover').each(function () {
                    $(this).remove();
                });
            }

        function showPopover(d) {
                $(this).popover({
                    title: d.name,
                    placement: 'auto top',
                    container: 'body',
                    trigger: 'manual',
                    html: true,
                    content: function () {
                        return "Year: " + d.label + "<br/>Number: " + d3.format(",")(d.value ? d.value : d.y1 - d.y0);
                    }
                });
                $(this).popover('show')
            };

    }
}
