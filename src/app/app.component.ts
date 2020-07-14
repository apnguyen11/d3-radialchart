import { Component, OnInit, Output, Input, AfterViewInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { data } from './radialData'

interface ChartData {
  date: Date;
  pressure: Number;
  pMin: Number;
  pMax: Number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  radialData = JSON.parse(JSON.stringify(data))

  @ViewChild('container') container: ElementRef;

  constructor(){
    console.log(this.radialData, 'this is the data')
  }

  ngOnInit(){
    const containerDiv = this.container.nativeElement;
    containerDiv.appendChild(this.createChart());
  }

  createChart() {
    const radialDiv = document.createElement('div');
    const radialGraph = d3.select(radialDiv).classed('radial-chart-wrapper', true);

    let x = d3.scaleUtc()
    .domain([Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1) - 1])
    .range([0, 2 * Math.PI])

    let width = 800;
    let margin = 10;
    let innerRadius = width / 5;
    let outerRadius = width / 2 - margin;

    let xAxis = g =>
      g
        .attr('font-family', 'sans-serif')
        .attr('font-size', 10)
        .attr('fill', 'white')
        .call(g =>
          g
            .selectAll('g')
            .data(x.ticks())
            .enter()
            .append('g')
            .each((d, i) => (d.id = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })))
            .call(g =>
              g
                .append('path')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr(
                  'd',
                  d => `
                M${d3.pointRadial(x(d), innerRadius)}
                L${d3.pointRadial(x(d), outerRadius)}
              `,
                ),
            )
            .call(g =>
              g
                .append('path')
                .attr('id', d => d.id)
                .datum(d => [d, d3.timeDay.offset(d, 1)])
                .attr('fill', 'none')
                .attr(
                  'd',
                  ([a, b]) => `
                M${d3.pointRadial(x(a), innerRadius)}
                A${innerRadius},${innerRadius} 0,0,1 ${d3.pointRadial(x(b), innerRadius)}
              `,
                ),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', 10)
                .append('textPath')
                .attr('startOffset', 10)
                .attr('xlink:href', d => '#' + d.id)
                .text(d => d.id),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', -60)
                .attr('dx', -70)
                .attr('font-size', 30)
                .attr('fill-opacity', 0.6)
                .text(this.radialData[this.radialData.length - 1].pressure.toFixed(2) + 'PSI'),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', -25)
                .attr('dx', -45)
                .attr('font-size', 20)
                .attr('fill-opacity', 0.6)
                .text('Pod:'),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', 33)
                .attr('dx', 0)
                .attr('font-size', 240)
                .attr('fill-opacity', 0.6)
                .attr('fill', 'blue')
                .text('-'),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', 13)
                .attr('dx', -45)
                .attr('font-size', 20)
                .attr('fill-opacity', 0.6)
                .text('LP: Pass'),
            )
            .call(g =>
              g
                .append('text')
                .attr('dy', 50)
                .attr('dx', -45)
                .attr('font-size', 20)
                .attr('opacity', 0.6)
                .text('HP: Fail'),
            ),
        );

    let yAxis = g =>
      g
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 13)
        .attr('color', 'black')
        .call(g =>
          g
            .selectAll('g')
            .data(y.ticks().reverse())
            .enter()
            .append('g')
            .attr('fill', 'none')
            .call(g =>
              g
                .append('circle')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr('r', y),
            )
            .call(g =>
              g
                .append('text')
                .attr('y', d => -y(d))
                .attr('dy', '0.35em')
                .attr('color', 'lightsteelblue')
                .text((x, i) => `${x.toFixed(0)}${i ? '' : 'Low Pressure'}`)
                .clone(true)
                .attr('y', d => -y(d))
                .selectAll(function() {
                  return [this, this.previousSibling];
                })
                .clone(true)
                .attr('fill', 'currentColor')
                .attr('stroke', 'none'),
            ),
        );

    let y2Axis = g =>
      g
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('font-size', 13)
        .attr('color', 'black')
        .call(g =>
          g
            .selectAll('g')
            .data(y.ticks().reverse())
            .enter()
            .append('g')
            .attr('fill', 'none')
            .call(g =>
              g
                .append('circle')
                .attr('stroke', '#7EE2FF')
                .attr('stroke-opacity', 0.6)
                .attr('r', y),
            )
            .call(g =>
              g
                .append('text')
                .attr('y', d => y(d))
                .attr('dy', '0.35em')
                .attr('color', 'white')
                .text((x, i) => `${x.toFixed(0)}${i ? '' : 'High Pressure'}`)
                .clone(true)
                .attr('y', d => y(d))
                .selectAll(function() {
                  return [this, this.previousSibling];
                })
                .clone(true)
                .attr('fill', 'currentColor')
                .attr('stroke', 'none'),
            ),
        );

    // let y = d3
    //   .scaleLinear()
    //   .domain([d3.min(this.radialData, d => 0), d3.max(this.radialData, d => 500)])
    //   .range([innerRadius, outerRadius]);

     let y = d3.scaleLinear()
      .domain([d3.min(data, d => d.pMin), d3.max(data, d => d.pMax)])
      .range([innerRadius, outerRadius])

    let line = d3
      .lineRadial<ChartData>()
      .curve(d3.curveLinear)
      .angle(d => x(new Date(d.date).setHours(new Date(d.date).getHours() + 5)));

    let area = d3
      .areaRadial<ChartData>()
      .curve(d3.curveLinear)
      .angle(d => x(new Date(d.date).setHours(new Date(d.date).getHours() + 5)));

    const svg = radialGraph
      .append('svg')
      .attr('viewBox', '-1051 -420 2100 2500')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round');

    // for (let i = 0; i < this.plist500.length; i++) {
    //   svg
    //     .append('path')
    //     .attr('fill', 'none')
    //     .attr('stroke', 'lightsteelblue')
    //     .attr('stroke-opacity', 0.88)
    //     .attr('stroke-width', 3)
    //     .attr('d', line.radius(d => y(d.Value))(this.plist500[i]));
    // }

    // for (let i = 0; i < this.plist5000.length; i++) {
    //   svg
    //     .append('path')
    //     .attr('fill', 'none')
    //     .attr('stroke', 'white')
    //     .attr('stroke-opacity', 0.88)
    //     .attr('stroke-width', 3)
    //     .attr('d', line.radius(d => y2(d.Value))(this.plist5000[i]));
    // }

    // svg
    //   .append('path')
    //   .attr('fill', '#15CE07')
    //   .attr('fill-opacity', 0.2)
    //   .attr('d', area.innerRadius(d => y(d.min)).outerRadius(d => y(d.max))(this.p500Data));

    // svg
    //   .append('path')
    //   .attr('fill', '#15CE07')
    //   .attr('fill-opacity', 0.2)
    //   .attr('d', area.innerRadius(d => y(d.min)).outerRadius(d => y(d.max))(this.p5000Data));

    svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line
        .radius(d => y(d.pressure))
      (this.radialData));

      svg.append("path")
      .attr("fill", "lightsteelblue")
      .attr("fill-opacity", 0.2)
      .attr("d", area
          .innerRadius(d => y(d.pMin))
          .outerRadius(d => y(d.pMax))
        (this.radialData));


    svg.append('g').call(yAxis);

    svg.append('g').call(y2Axis);

    svg.append('g').call(xAxis);

    return radialDiv;
  }
}
