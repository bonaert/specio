var width = 1000;
var height = 500;

var rootCircleRadius = 30;
var rootCircleCenterXPos = 30;

var childCircleRadius = 20;

var verticalMargin = 30;

var horizontalOffset = 100;
var verticalBarXPos = rootCircleCenterXPos + rootCircleRadius + horizontalOffset;

var textOffset = 30;
var barWidth = 100;

// Distance between two children
var heightBetweenChildren = 100;

function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getName(data) {
    return data["vernacularName"] || data["canonicalName"] || data["scientificName"] || "Error: could not find name";
}

function getScientificName(data) {
    var name = data.scientificName;

    // Used when name has date and scientist attached
    if (typeof data.authorship !== "undefined") {
        if (data.authorship === "") {
            return name;
        }

        var index = name.indexOf(data.authorship);
        if (index !== -1) {
            // remove the space before the name too
            return name.substring(0, index - 1);
        }
    }

    return name;
}

function showInformation(data) {
    console.log(data);

    var speciesContainer = d3.select('#speciesContainer')
    var infoSelection = d3.select('#infoContainer')

    // Resize both to occupy half of the page
    speciesContainer.style('width', '400px');
    infoSelection.style('width', 'calc(100% - 400px)');

    // Remove existing data, if it exists
    d3.select('#speciesData').remove();

    var divSelection = infoSelection.append('div').attr('id', 'speciesData')


    var name = getScientificName(data)
    var url = "http://en.wikipedia.org/wiki/" + name;

    var otherSiteSelection = divSelection.append('p')
        .text('Try other site')
        .style('margin-left', '100px')
        .on('click', function () {
            var url = "http://www.gbif.org/species/" + data['key'];
            var iframeSelection = divSelection.select('iframe');
            iframeSelection.attr('src', url);
            this.remove();
        });

    var iframeSelection = divSelection.append('iframe');
    iframeSelection.attr('src', url)
        .style('width', 'calc(100%)')
        .style('margin-left', '100px')
        .style('height', '1000px');
}

function showChildren(data, svgContainer, tree) {
    console.log(data);

    var speciesContainer = d3.select('#speciesContainer')
    var infoSelection = d3.select('#infoContainer')
    d3.select('iframe').remove();

    // Resize both to occupy half of the page
    speciesContainer.style('width', 'calc(100%)');
    infoSelection.style('width', '0px');

    tree.setRootToChild(data['key']);
    tree.fetchChildren(function (children) {
        addChildren(svgContainer, tree, children);
    });
}

function clearSvg(svgContainer) {
    svgContainer.selectAll('g').remove();
    svgContainer.selectAll('circle').remove();
    svgContainer.selectAll('image').remove();
    svgContainer.selectAll('line').remove();
}

function resizeSvg(svgContainer, children) {
    resizeSvgHeight(svgContainer, children);
}

function resizeSvgHeight(svgContainer, children) {

    // Distance between two children
    var contentHeight = Math.max(500, (children.length - 1) * heightBetweenChildren);
    var marginHeight = 2 * verticalMargin;
    height = contentHeight + marginHeight;
    svgContainer.attr('height', height);
}

function addRootCircle(svgContainer) {
    var height = svgContainer.attr('height');

    svgSelection.append('circle')
        .attr("cx", rootCircleCenterXPos)
        .attr("cy", height / 2)
        .attr("r", rootCircleRadius)
        .style("fill", "green");
}

function addHorizontalLineFromCircle(svgContainer) {
    var height = svgContainer.attr('height');

    svgSelection.append('line')
        .attr('x1', rootCircleCenterXPos + rootCircleRadius)
        .attr('y1', height / 2)
        .attr('x2', verticalBarXPos)
        .attr('y2', height / 2)
        .attr('stroke-width', 5)
        .attr('stroke', 'black');
}

function addVerticalLine(svgContainer) {
    var height = svgContainer.attr('height');

    svgSelection.append('line')
        .attr('x1', verticalBarXPos)
        .attr('y1', verticalMargin)
        .attr('x2', verticalBarXPos)
        .attr('y2', height - verticalMargin)
        .attr('stroke-width', 5)
        .attr('stroke', 'black');
}

function addHorizontalBars(childrenSelection, numChildren) {
    for (var i = 0; i < numChildren; i++) {
        var height = i * heightBetweenChildren;
        var yPos = height + verticalMargin;


        childrenSelection.append('line')
            .attr('x1', verticalBarXPos)
            .attr('y1', yPos)
            .attr('x2', verticalBarXPos + barWidth)
            .attr('y2', yPos)
            .attr('stroke-width', 5)
            .attr('stroke', 'black');
    }
}

function addCircles(childrenSelection, childrenData) {
    var circles = childrenSelection.selectAll('image')
        .data(childrenData)
        .enter()
        .append('image');

    var num = 0;
    var remainingSpace = height - 2 * verticalMargin;

    var circleAttributes = circles
        .attr('x', verticalBarXPos + barWidth - 10)
        .attr('y', function (data, index) {
            var height = index * heightBetweenChildren;
            var yPos = height + verticalMargin - 15;
            return yPos;
        })
        .attr('height', 30)
        .attr('width', 30)
        .attr('xlink:href', '/image/info.png')
        .on("click", showInformation)
}

function addText(svgContainer, tree, childrenSelection, childrenData) {
    var text = childrenSelection.selectAll("text")
        .data(childrenData)
        .enter()
        .append("text");

    var textAttributes = text
        .attr('x', verticalBarXPos + barWidth + textOffset)
        .attr('y', function (data, index) {
            var height = index * heightBetweenChildren;
            var textAdjustment = 6;
            var yPos = height + verticalMargin + textAdjustment;
            return yPos;
        })
        .text(function (data) {
            return capitalise(getName(data));
        })
        .attr('font-family', 'sans-serif')
        .attr('font-size', '20px')
        .attr('fill', 'rgb(83, 83, 83)')
        .on('click', function (data) {
            showChildren(data, svgContainer, tree);
        });;
}

function addChildrenToSvg(svgContainer, tree, childrenData) {
    var childrenSelection = svgContainer.append('g').attr('id', 'childrenGroup');
    var numChildren = childrenData.length;

    addHorizontalBars(childrenSelection, numChildren);
    addCircles(childrenSelection, childrenData);
    addText(svgContainer, tree, childrenSelection, childrenData);
}

function addChildren(svgContainer, tree, children) {
    clearSvg(svgContainer)
    resizeSvg(svgContainer, children);
    addRootCircle(svgContainer);
    addHorizontalLineFromCircle(svgContainer);
    addVerticalLine(svgContainer);
    addChildrenToSvg(svgContainer, tree, children);
}

//tree.fetchChildren(addChildren);
var data = [{
    'key': 10,
    'scientificName': 'Bob'
}, {
    'key': 20,
    'scientificName': 'Joe'
}, {
    'key': 30,
    'scientificName': 'Jim'
}, {
    'key': 40,
    'scientificName': 'What the hell is this? You should do something else, Gregory!'
}];

var selection = d3.select("#speciesContainer");

var svgSelection = selection.append("svg")
    .attr('width', width)
    .attr('height', height);

var tree = new Tree();
tree.fetchChildren(function (children) {
    addChildren(svgSelection, tree, children);
});
//addChildren(svgSelection, data);
