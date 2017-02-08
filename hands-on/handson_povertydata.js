function PovertyRateVis(svg_canvas_id) {

    this.svg_id = svg_canvas_id;

    this.render = function(min_rate, max_rate, nested_data, avg_data) {
        var plot_width = 150;
        var plot_spacing = 30;

        var y = d3.scaleLinear()
            .domain([min_rate, max_rate])
            .range([plot_width, 0]);

        var svg = d3.select("#"+this.svg_id);

        var region_grps = svg.selectAll(".region_groups").data(nested_data)
            .enter().append("g")
            .attr("class", "region_groups")
            .attr("transform", function(d,i) {
                var x_shift = plot_spacing + (plot_spacing + plot_width)*i;
                return "translate("+x_shift+","+plot_spacing+")";
            });

        region_grps.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", plot_width)
            .attr("height", plot_width)
            .on("mousemove", this.updateHighlight)
            .on("mouseout", this.removeHighlight)
            .style("fill", "#f4f4f4");

        region_grps.append("text")
            .attr("class", "label")
            .attr("x", -2)
            .attr("y", plot_width)
            .attr("text-anchor", "end")
            .text(min_rate);

        region_grps.append("text")
            .attr("class", "label")
            .attr("x", -2)
            .attr("y", 0)
            .attr("dy", "1.0em")
            .attr("text-anchor", "end")
            .text(max_rate);

        // add region label
        region_grps.append("text")
            .attr("class", "label")
            .attr("x", 0)
            .attr("y", plot_width)
            .attr("dy", "1.0em")
            .text(function(d) {return d.key;});

        //set the line out of canvas (invisible) at first then update it
        region_grps.append("line")
            .attr("class", "highlightline")
            .attr("x1", 0)
            .attr("x2", plot_width)
            .attr("y1", -100)
            .attr("y2", -100)
            .style("stroke", "gold")
            .style("stroke-width", "4");

        var state_lines = region_grps.selectAll(".state_line").data(function(d) { return d.values;});

        state_lines.enter().append("line")
            .attr("class", "state_line")
            .attr("x1", 0)
            .attr("x2", plot_width)
            .attr("y1", function(d) {
                return y(d.poverty_rate);
            })
            .attr("y2", function(d) {return y(d.poverty_rate);})
            .style("stroke", "lightblue");

        region_grps.append("line")
            .attr("class", "avgline")
            .attr("x1", 0)
            .attr("x2", plot_width)
            .attr("y1", function(d,i) {
                var region_avg_data = avg_data[i];
                var region_avg_values = region_avg_data.value;
                var pr_mean = region_avg_values.poverty_rate;
                return y(pr_mean);
            })
            .attr("y2", function(d,i) {return y(avg_data[i].value.poverty_rate);})
            .style("stroke", "red");

        //add average label
        region_grps.append("text")
            .attr("class", "label")
            .attr("x", -2)
            .attr("y", function(d,i) {return y(avg_data[i].value.poverty_rate);})
            .attr("dy", "0.4em")
            .attr("text-anchor", "end")
            .style("fill", "red")
            .text(function(d,i) {return Math.round(avg_data[i].value.poverty_rate);});

    }

    this.updateHighlight = function() {
        var mouse_coords = d3.mouse(this);
        d3.selectAll(".highlightline")
            .attr("y1", mouse_coords[1])
            .attr("y2", mouse_coords[1]);
    }

    this.removeHighlight = function() {
        d3.selectAll(".highlightline")
            .attr("y1", -100)
            .attr("y2", -100);
    }

    //load data
    var url = "https://opal.ils.unc.edu/~lying910/data/states.csv";

    var this_vis = this;
    d3.csv(url,
        function(d) {
            return {
                state: d.state,
                life_expectancy: +d.life_expectancy,
                poverty_rate: +d.poverty_rate,
                region: d.region
            }
        },
        function(error, data) {
            if (error != null) {
                alert("error!");
            }
            else {
                console.log("Just loaded " + data.length + " records.");

                var min_pr = d3.min(data, function(d) {
                    return d.poverty_rate;
                });
                var max_pr = d3.max(data, function(d) { return d.poverty_rate; });

                //nest state data by region
                var nested_data = d3.nest()
                    .key(function(d) {return d.region;})
                    .sortKeys(d3.ascending)
                    .entries(data);

                //calculate means for each region
                var avg_data = d3.nest()
                    .key(function(d) {return d.region;})
                    .sortKeys(d3.ascending)
                    .rollup(function(group_of_states) {
                        var pr_mean = d3.mean(group_of_states, function(d) {return d.poverty_rate;});
                        var le_mean = d3.mean(group_of_states, function(d) {return d.life_expectancy;});
                        return {
                            poverty_rate: pr_mean,
                            life_expectancy: le_mean
                        };
                    })
                    .entries(data);

                this_vis.render(min_pr, max_pr, nested_data, avg_data);
            }
        });
}