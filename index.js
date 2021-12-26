function formatTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return `${minutes}:${seconds}`;
}

function ScatterPlot() {
  const [data, setData] = React.useState([]);

  React.useEffect(() => {
    async function getData() {
      const response = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
      );
      const json = await response.json();
      setData(json);
    }
    getData();
  }, []);

  return (
    <div className="container">
      <div class="title">
        <h1 id="title">Doping in Professional Bicycle Racing</h1>
        <h2>35 Fastest times up Alpe d'Huez</h2>
      </div>
      <div className="chart" style={{ width: data.length * 5 * 6}}>
        <Graph data={data} />
        <div id="legend">Green: No Doping Allegations | Red: Riders with Doping Allegations</div>
      </div>
    </div>
  );
}

function Graph({ data }) {
  const height = 500,
    radius = 5,
    width = data.length * radius * 5;

  React.useEffect(() => {
    if (data && data.length) return createChart();
  }, [data]);

  const createChart = () => {
    const years = data.map((d) => d.Year),
      seconds = data.map((d) => d.Seconds);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "tooltip");

    const svg = d3.select("svg");

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(years) - 1, d3.max(years) + 1])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(seconds), d3.max(seconds)])
      .range([0, height]);

    const xAxis = d3.axisBottom(xScale).tickFormat((d) => d);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => formatTime(d));

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);

    svg.append("g").attr("id", "y-axis").call(yAxis);

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.Year))
      .attr("cy", (d) => yScale(d.Seconds))
      .attr("r", radius)

      .attr("class", "dot")
      .attr("data-xvalue", (d) => d.Year)
      .attr("data-yvalue", (d) => {
        const t = d.Time.split(":");
        return new Date(1970, 0, 1, 0, t[0], t[1]);
      })

      .style("fill", (d) => (d.Doping ? "red" : "green"))
      .on("mouseover", (e, d) => {
        tooltip
          .style("left", e.pageX + 20 + "px")
          .style("top", e.pageY + 20 + "px")
          .style("display", "inline-block")
          .style("opacity", 0.7)
          .attr("data-year", d.Year)
          .html(
            `Year: ${d.Year}<br>Time: ${d.Time}<br><br>${d.Name}${
              d.Doping ? `<br><br>${d.Doping}` : ""
            }`
          );
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });
  };
  return (
    <div className="chart">
      <svg width={width} height={height}></svg>
    </div>
  );
}

ReactDOM.render(<ScatterPlot />, document.getElementById("root"));
