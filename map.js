
        /* window.addEventListener('load', (event) => {
            let div = document.createElement('div');
            div.setAttribute("id", "tip");
            document.querySelector("body").appendChild(div);
        }); */

        /*  This visualization was made possible by modifying code provided by:
        
        Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
        https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
            	
        Malcolm Maclean, tooltips example tutorial
        http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
        
        Mike Bostock, Pie Chart Legend
        http://bl.ocks.org/mbostock/3888852  */


        //Width and height of map
        var width = 960;
        var height = 500;
        

        // D3 Projection
        var projection = d3.geo.albersUsa()
            .translate([width / 2, height / 2])    // translate to center of screen
            .scale([1000]);          // scale things down so see entire US

        // Define path generator
        var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
            .projection(projection);  // tell path generator to use albersUsa projection


        // Define linear scale for output
        var color = d3.scale.linear()
            .range(["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"]);

        var legendText = [">200 ($ / month)","180 - 200","150 - 180", "130 - 150", "110 - 130", "<110"];

        //Create SVG element and append map to the SVG
        var svg = d3.select("#map")
            .append("svg")
            .attr("class", "svg")
            .attr("width", width)
            .attr("height", height);

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
            color.domain([90, 110, 130, 150, 180, 200]); // setting the range of the input data

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
                                "<h3 style='margin: 0; text-align: center; text-decoration: underline; margin-bottom: 5px'>" +d.properties['name']+ "</h3>" +
                            "<p style='padding: 0; margin: 0'><b style='color:orange'>2018</b>: " + d.properties['avg_2018'] + " ¢/kWh</p>" +
                            "<p style='padding: 0; margin: 0'><b style='color:orange'>2019</b>: " + d.properties['avg_2019'] + " ¢/kWh</p>" +
                            "<p style='padding: 0; margin: 0'><b style='color:orange'>Change in 2019</b>: " + value + "</p>" +
                            "<p style='padding: 0; margin: 0'><b style='color:orange'>Avg monthly Bill:</b> $." + d.properties['month_rate'] + "</p>" +
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


                
                
                
                // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
                var legend = d3.select("body").append("svg")
                    .attr("class", "legend")
                    .attr("width", 140)
                    .attr("height", 200)
                    .selectAll("g")
                    .data(color.domain().slice().reverse())
                    .enter()
                    .append("g")
                    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
                
                legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", color);

                legend.append("text")
                    .data(legendText)
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .text(function (d) { return d; });
            });

        });
    
