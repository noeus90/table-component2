import React from "react";
import PropTypes from "prop-types";

class Column extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderAsc: true
    };
    //console.log(props);
    this.defaultSortFn = this.defaultSortFn.bind(this);
    this.getValueFromRow = this.getValueFromRow.bind(this);
    this.sortFn = this.sortFn.bind(this);
    this.defaultSortFn = this.defaultSortFn.bind(this);
    this.filterFn = this.filterFn.bind(this);
  }

  render() {
    return (
      <th style={{ width: this.props.width }}>
        <span>{this.props.name}</span>
        {this.props.sortable && (
          <button
            onClick={() => {
              this.props.sortCb(this.sortFn, this.state.orderAsc);
              this.setState({ orderAsc: !this.state.orderAsc });
            }}
          >
            {this.state.orderAsc ? "↓" : "↑"}
          </button>
        )}
      </th>
    );
  }

  getValueFromRow(row) {
    return typeof this.props.dataKey === "function"
      ? this.props.dataKey(row)
      : row[this.props.dataKey];
  }

  sortFn(a, b) {
    let valueA = this.getValueFromRow(a);
    let valueB = this.getValueFromRow(b);
    if (this.props.sortFn) {
      return this.props.sortFn(valueA, valueB);
    } else {
      return this.defaultSortFn(valueA, valueB);
    }
  }

  filterFn(a, data){
    let valueA = this.getValueFromRow(a);
    if (this.props.sortFn) {
      return this.props.sortFn(valueA, data);
    } else {
      return this.defaultSortFn(valueA, data);
    }
  }

  defaultSortFn(a, b) {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  defaultFilterFn(a, data) {
    return a.includes(data);
  }
}

Column.propTypes = {
  name: PropTypes.string.isRequired,
  sortable: PropTypes.bool,
  sortFn: PropTypes.func,
  sortCb: PropTypes.func, //Internal use
  dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired
};

module.exports = Column;
