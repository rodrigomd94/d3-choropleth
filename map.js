
        /*  This visualization was made possible by modifying code provided by:
        
        Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
        https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
            	
        Malcolm Maclean, tooltips example tutorial
        http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
        
        Mike Bostock, Pie Chart Legend
        http://bl.ocks.org/mbostock/3888852  */


        //Width and height of map
        var width = 960;
        var height = 570;
        

        // D3 Projection
        var projection = d3.geo.albersUsa()
            .translate([width / 2, height / 2])    // translate to center of screen
            .scale([825]);          // scale things down so see entire US

        // Define path generator
        var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
            .projection(projection);  // tell path generator to use albersUsa projection


        // Define linear scale for output
        var color = d3.scale.linear()
            .range(["#ffffcc","#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c","#bd0026", "#800026"]);

        var legendText = ["200+","146","138","130","122","114","106", "98","90","0"];



        //Create SVG element and append map to the SVG
        var svg = d3.select("#map")
            .append("svg")
            .attr("class", "svg")
            .attr("viewBox", `0 0 ${width} ${height}`);

        // Append Div for tooltip to SVG
        var div = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        var tooltip = d3.select('body')
                .append('div')
                .attr('class', 'tooltip');
        
            

        // Load in my states data!
        d3.csv("electricity.csv", function (data) {
            color.domain([0, 90, 98, 106, 114, 122, 130, 138, 146, 300]); // setting the range of the input data

            // Load GeoJSON data and merge with states data
            d3.json("us-states.json", function (json) {

                // Loop through each state data value in the .csv file
                for (var i = 0; i < data.length; i++) {

                    // Grab State Name
                    var dataState = data[i].state;

                    // Grab data value 
                    var dataValue = data[i].month_rate;

                    // Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {
                        var jsonState = json.features[j].properties.name;

                        if (dataState == jsonState) {

                            // Copy the data value into the JSON
                            json.features[j].properties.rate = dataValue;
                            json.features[j].properties.code = data[i].code;
                            json.features[j].properties.avg_2018 = data[i].avg_2018;
                            json.features[j].properties.avg_2019 = data[i].avg_2019;
                            json.features[j].properties.prcnt_change = data[i].prcnt_change;
                            json.features[j].properties.month_rate = data[i].month_rate;

                            // Stop looking through the JSON
                            break;
                        }
                    }
                }

                // Bind the data to the SVG and create one path per GeoJSON feature
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "1")
                    .style("fill", function (d) {

                        // Get data value
                        var value = d.properties.rate;
                        if (value) {
                            //If value exists…
                            return color(value);
                        } else {
                            //If value is undefined…
                            return "rgb(213,222,217)";
                        }
                    })
                    .on("mouseover", () => tooltip.style('visibility', 'visible'))
                    .on("mousemove", (d) => {
                        let value;
                        if(parseFloat(d.properties['prcnt_change'])>=0)
                            value="<span style='color: #ff0007'>"+parseFloat(d.properties['prcnt_change'])+"%</span>";
                            else value="<span style='color: #008002'>"+parseFloat(d.properties['prcnt_change'])+"%</span>";
                            let html="<div style='padding: 3px; text-align: left; color: black; font-size: 14px; font-weight: 400; opacity: .9; background-color: #f1f1f1; border-radius: 3px'>" +
                                "<h3>" +d.properties['name']+ "</h3>" +
                            "<p class='tooltip-category'><b style='color:darkblue'>2018</b>: " + d.properties['avg_2018'] + " ¢/kWh</p>" +
                            "<p class='tooltip-category'><b style='color:darkblue'>2019</b>: " + d.properties['avg_2019'] + " ¢/kWh</p>" +
                            "<p class='tooltip-category'><b style='color:darkblue'>Change in 2019</b>: " + value + "</p>" +
                            "<p class='tooltip-category'><b style='color:darkblue'>Avg monthly Bill:</b> $." + d.properties['month_rate'] + "</p>" +
                            "</div>";

                        tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                        tooltip.html(html);
                    })
                    .on("mouseout", (d) => {
                        tooltip.style('visibility', 'hidden');
                    });

                svg.selectAll("text")
                    .data(json.features)
                    .enter()
                    .append("svg:text")
                    .text(function (d) {
                        return d.properties.code;
                    })
                    .attr("x", function (d) {
                        if (d.properties.code == 'DE') return path.centroid(d)[0] + 18;
                        if (d.properties.code == 'RI') return path.centroid(d)[0] + 8;
                        if (d.properties.code == 'NJ') return path.centroid(d)[0] + 5;

                        return path.centroid(d)[0];
                    })
                    .attr("y", function (d) {
                        if(d.properties.code == 'NJ') return path.centroid(d)[1] + 15;
                        if (d.properties.code == 'DE' || d.properties.code == 'RI') return path.centroid(d)[1] + 12;
                        return path.centroid(d)[1];
                    })
                    .attr("class", "state_text");


                
                
            

                var legend = d3.select("#legend").append("svg")
                    .attr("class", "legend")
                    .attr("viewBox", `0 0 930 40`)
                    .selectAll("g")
                    .data(color.domain().slice().reverse())
                    .enter()
                    .append("g");

                
                legend.append("rect")
                    .attr("width", 100)
                    .attr("height", 12)
                    .attr("y", 30)
                    .attr("x", 21)
                    .style("fill", color)
                    .attr("transform", function (d, i) { return "translate(" + i * 100 + ", 0)"; });


                legend.append("text")
                    .data(legendText)
                    .attr("y", 20)
                    .attr("x", 21)
                    .attr("text-anchor","middle")
                    .style("font-size", "3vmin")
                    .style("font-weight", "lighter")
                    .attr("transform", function (d, i) { return "translate(" + i * 100 + ", 0)"; })
                    .text(function (d) { return d; })
                    ;
                     
                
            });

        });
    
