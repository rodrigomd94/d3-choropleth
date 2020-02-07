
/*  This visualization was made possible by modifying code provided by:
 
Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
    	
Malcolm Maclean, tooltips example tutorial
http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
 
Mike Bostock, Pie Chart Legend
http://bl.ocks.org/mbostock/3888852  */
//zoom function




//Width and height of map
var width = 960;
var height = 570;

var display2018='block;';


// D3 Projection
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])    // translate to center of screen
    .scale([825]);          // scale things down so see entire US

// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection


// Define linear scale for output
var color = d3.scaleLinear()
    .range(["#ffffcc", "#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"]);

var legendText = ["33 ¢/kWh", "26", "22", "28", "14", "12", "11", "10", "9", "0"];



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


var zoom = d3.zoom()
    .on('zoom', function () {
        canvas.attr('transform', d3.event.transform);
    });

var canvas = svg
    .call(zoom)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .insert('g', ':first-child');

d3.select('#zoom-in').on('click', function () {
    // Smooth zooming
    zoom.scaleBy(svg.transition().duration(750), 1.3);
});

d3.select('#zoom-out').on('click', function () {
    // Ordinal zooming
    zoom.scaleBy(svg, 1 / 1.3);
});

// Load in my states data!
d3.csv("electricity.csv", function (data) {
    color.domain([0, 9, 10, 11, 12, 14, 18, 22, 26, 33]); // setting the range of the input data

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
                    json.features[j].properties.filtered= 1;
                    // Stop looking through the JSON
                    break;
                }
            }
        }


        /*------draw maps--------*/
        drawBasemap(json);
        setColor(json);

        /*-----end draw map----*/

        /*---------------------filtering------------------------------
        ------------------------------------------------------------*/

        // ----------month filter
        var minMonth=0;
        var maxMonth=280;
        var min2018=0;
        var max2018=33;
        var min2019=0;
        var max2019=33;
        var minIncrease=-8;
        var maxIncrease=8;
        $("#month-slider").slider({
            range: true,
            min: 0,
            max: 300,
            values: [0, 280],
            slide: function (event, ui) {
                minMonth = $("#month-slider").slider("values", 0);
                maxMonth = $("#month-slider").slider("values", 1);
                $("#month-amount").val("$." + ui.values[0] + " - $." + ui.values[1]);
                setTimeout(setColor(filterJson(json, minMonth, maxMonth, min2018, max2018, min2019, max2019, minIncrease, maxIncrease)), 10);

            }

        });
        $("#month-amount").val("$" + minMonth +
         " - $" + maxMonth);
         // ----------2018 price filter
        
        $("#2018-slider").slider({
            range: true,
            min: 0,
            max: 33,
            step:0.5,
            values: [0, 33],
            slide: function (event, ui) {
                min2018 = $("#2018-slider").slider("values", 0);
                max2018 = $("#2018-slider").slider("values", 1);
                $("#2018-amount").val(ui.values[0] + " - " + ui.values[1]+" ¢/kWh");
                setTimeout(setColor(filterJson(json, minMonth, maxMonth, min2018, max2018, min2019, max2019, minIncrease, maxIncrease)), 10);


            }

        });
        $("#2018-amount").val(min2018 +
         " - " + max2018+ " ¢/kWh");

         // ----------2019 price filter
        
        $("#2019-slider").slider({
            range: true,
            min: 0,
            max: 33,
            step:0.5,
            values: [0, 33],
            slide: function (event, ui) {
                min2019 = $("#2019-slider").slider("values", 0);
                max2019 = $("#2019-slider").slider("values", 1);
                $("#2019-amount").val(ui.values[0] + " - " + ui.values[1]+" ¢/kWh");
                setTimeout(setColor(filterJson(json, minMonth, maxMonth, min2018, max2018, min2019, max2019, minIncrease, maxIncrease)), 10);


            }

        });
        $("#2019-amount").val(min2019 +
         " - " + max2019 + " ¢/kWh");

         // ----------price increase filter
        
        $("#increase-slider").slider({
            range: true,
            min: -8,
            max: 8,
            step:0.1,
            values: [-8, 8],
            slide: function (event, ui) {
                minIncrease = $("#increase-slider").slider("values", 0);
                maxIncrease = $("#increase-slider").slider("values", 1);
                $("#increase-amount").val(ui.values[0] + "% - " + ui.values[1])+"%";
                setTimeout(setColor(filterJson(json, minMonth, maxMonth, min2018, max2018, min2019, max2019, minIncrease, maxIncrease)), 10);


            }

        });
        $("#increase-amount").val(minIncrease +
         "% - " + maxIncrease+ "%");


        /*---------end filtering---------------------------------*/
        /*-----------------------------------------------------*/

        var legend = d3.select("#legend").append("svg")
            .attr("class", "legend")
            .attr("viewBox", `0 0 940 45`)
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g");


        legend.append("rect")
            .attr("width", 100)
            .attr("height", 12)
            .attr("y", 30)
            .attr("x", 29)
            .style("fill", color)
            .attr("transform", function (d, i) { return "translate(" + i * 100 + ", 0)"; });


        legend.append("text")
            .data(legendText)
            .attr("y", 20)
            .attr("x", 29)
            .attr("text-anchor", "middle")
            .style("font-size", "2vmin")
            .style("font-weight", "lighter")
            .attr("transform", function (d, i) { return "translate(" + i * 100 + ", 0)"; })
            .text(function (d) { return d; })
            ;

    });
    


});
function drawBasemap(json) {
    canvas.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", "transparent")
        .on("mouseover", () => tooltip.style('visibility', 'visible'))
        .on("mousemove", (d) => {
            let value;
            if (parseFloat(d.properties['prcnt_change']) >= 0)
                value = "<span style='color: #ff0007'>" + parseFloat(d.properties['prcnt_change']) + "%</span>";
            else value = "<span style='color: #008002'>" + parseFloat(d.properties['prcnt_change']) + "%</span>";
            let html = "<div style='padding: 3px; text-align: left; color: black; font-size: 14px; font-weight: 400; opacity: .9; background-color: #f1f1f1; border-radius: 3px'>" +
                "<h3>" + d.properties['name'] + "</h3>" +
                "<p class='tooltip-category' id='2018-tooltip' style='display:"+display2018+"'><b style='color:darkblue;'>2018</b>: " + d.properties['avg_2018'] + " ¢/kWh</p>" +
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
    canvas.selectAll("text2")
        .data(json.features)
        .enter()
        .append("svg:text")
        .text(function (d) {
            return d.properties.code;
        })
        .attr("x", function (d) {
            if (d.properties.code == 'DE') return path.centroid(d)[0] + 5;
            if (d.properties.code == 'RI') return path.centroid(d)[0];
            if (d.properties.code == 'NJ') return path.centroid(d)[0]-5;
            if (d.properties.code == 'LA') return path.centroid(d)[0] - 10;
            if (d.properties.code == 'CA') return path.centroid(d)[0] - 5;

            return path.centroid(d)[0]-10;
        })
        .attr("y", function (d) {
            if (d.properties.code == 'NJ') return path.centroid(d)[1] + 15;
            if (d.properties.code == 'DE' || d.properties.code == 'RI') return path.centroid(d)[1] + 12;
            return path.centroid(d)[1];
        })
        .attr("class", "state_text");
        
}


function setColor(json) { // draws and colours the filtered states
    // Bind the data to the SVG and create one path per GeoJSON feature
    canvas.selectAll("path")
        
        .style("fill", "transparent");
    canvas.selectAll("path")
        .data(json.features)

        .style("fill", function (d) {
            // Get data value
            var value = d.properties.avg_2019;
           // console.log(d);
            if (value && d.properties.filtered) {
                //If value exists…
                return color(value);
            } else {
                //If value is undefined…
                return "transparent";
            }
        });



}

function filterJson(data, minMonth, maxMonth, min2018, max2018, min2019, max2019, minIncrease, maxIncrease) {

    var newJson=data;
    for (i=0; i<data.features.length; i++) {
        if (data.features[i].properties.rate > minMonth && data.features[i].properties.rate < maxMonth
             && data.features[i].properties.avg_2018 > min2018 && data.features[i].properties.avg_2018 < max2018
             && data.features[i].properties.avg_2019 > min2019 && data.features[i].properties.avg_2019 < max2019
             && parseFloat(data.features[i].properties.prcnt_change) > minIncrease && parseFloat(data.features[i].properties.prcnt_change) < maxIncrease) { //example filtering 
            newJson.features[i].properties.filtered=1;
        }else{
            newJson.features[i].properties.filtered=0;
        }
    }
    return newJson;
}

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("filterButton").style.visibility="hidden";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("filterButton").style.visibility="visible";
}
function remove2018(checkbox){
    if (!checkbox.checked){
        $("#2018-filter").css("display", "none");
        $("#2018-tooltip").css("display", "none");
        display2018="none;"
    }else{
        $("#2018-filter").css("display", "inline-block");
        $("#2018-tooltip").css("display", "inline-block");
        display2018="block;"
    }
}



