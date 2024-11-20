import React, { Component } from 'react';
import * as d3 from 'd3';
import './Child1.css';

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      company: 'Apple',
      selectedMonth: 'November',
    };
  }

  handleCompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

  componentDidUpdate() {
    if (this.props.data) {
      this.renderChart();
    }
  }

  renderChart() {
    const { data } = this.props;
    const { company, selectedMonth } = this.state;

    const filteredData = data.filter((d) => {
      const dateObj = new Date(d.Date);
      const monthName = dateObj.toLocaleString('default', { month: 'long' });

      return d.Company === company && monthName === selectedMonth;
    });

    const parseDate = d3.timeParse('%Y-%m-%d');
    filteredData.forEach((d) => {
      if (typeof d.Date === 'string') {
        d.Date = parseDate(d.Date.split(' ')[0]);
      } else if (d.Date instanceof Date) {
        d.Date = d.Date;
      } else {
        d.Date = null;
      }

      d.Open = +d.Open;
      d.Close = +d.Close;
    });

    const validData = filteredData.filter((d) => d.Date !== null && !isNaN(d.Open) && !isNaN(d.Close));

    if (validData.length === 0) {
      console.warn('No valid data for the selected company and month.');
      return; 
    }

    const margin = { top: 20, right: 100, bottom: 50, left: 50 }; 
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select('#chart').selectAll('*').remove();

    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(validData, (d) => d.Date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(validData, (d) => Math.min(d.Open, d.Close)),
        d3.max(validData, (d) => Math.max(d.Open, d.Close)),
      ])
      .nice()
      .range([height, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d')))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').call(d3.axisLeft(yScale));

    const lineOpen = d3
      .line()
      .x((d) => xScale(d.Date))
      .y((d) => yScale(d.Open));

    svg
      .append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', '#b2df8a')
      .attr('stroke-width', 2)
      .attr('d', lineOpen);

    const lineClose = d3
      .line()
      .x((d) => xScale(d.Date))
      .y((d) => yScale(d.Close));

    svg
      .append('path')
      .datum(validData)
      .attr('fill', 'none')
      .attr('stroke', '#e41a1c')
      .attr('stroke-width', 2)
      .attr('d', lineClose);

    const tooltip = d3
      .select('#chart')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

    svg
      .selectAll('circle.open')
      .data(validData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.Date))
      .attr('cy', (d) => yScale(d.Open))
      .attr('r', 5)
      .attr('fill', '#b2df8a')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(
            `<strong>Date:</strong> ${d.Date.toDateString()}<br>
             <strong>Open:</strong> $${d.Open}<br>
             <strong>Close:</strong> $${d.Close}<br>
             <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}`
          )
          .style('left', `${x+65}px`)
          .style('top', `${y}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

    svg
      .selectAll('circle.close')
      .data(validData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.Date))
      .attr('cy', (d) => yScale(d.Close))
      .attr('r', 5)
      .attr('fill', '#e41a1c')
      .on('mouseover', (event, d) => {
        const [x, y] = d3.pointer(event);
        tooltip.transition().duration(200).style('opacity', 1);
        tooltip
          .html(
            `<strong>Date:</strong> ${d.Date.toDateString()}<br>
             <strong>Open:</strong> $${d.Open}<br>
             <strong>Close:</strong> $${d.Close}<br>
             <strong>Difference:</strong> $${(d.Close - d.Open).toFixed(2)}`
          )
          .style('left', `${x+65}px`)
          .style('top', `${y}px`);
      })
      .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width + 40}, 20)`); 

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#b2df8a');

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 15)
      .text('Open')
      .style('font-size', '14px')
      .style('fill', '#000');

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 30)
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', '#e41a1c');

    legend
      .append('text')
      .attr('x', 25)
      .attr('y', 45)
      .text('Close')
      .style('font-size', '14px')
      .style('fill', '#000');
  }

  render() {
    const { company, selectedMonth } = this.state;

    return (
      <div className="container">
        <div className="controls">
          <div>
            <label>Company:</label>
            <div>
              {['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta'].map((comp) => (
                <label key={comp}>
                  <input
                    type="radio"
                    value={comp}
                    checked={company === comp}
                    onChange={this.handleCompanyChange}
                  />
                  {comp}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label>Month:</label>
            <select value={selectedMonth} onChange={this.handleMonthChange}>
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

export default Child1;

