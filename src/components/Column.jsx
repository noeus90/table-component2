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
    this.getItemsToSort = this.getItemsToSort.bind(this);
    this.sortFn = this.sortFn.bind(this);
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

  getItemsToSort(rowA,rowB){
    let valueA, valueB;

    if (typeof this.props.dataKey === "function") {
      valueA = this.props.dataKey(rowA);
      valueB = this.props.dataKey(rowB);
    } else {
      valueA = rowA[this.props.dataKey];
      valueB = rowB[this.props.dataKey];
    }
    return {valueA,valueB};
  }

  sortFn(a, b){
    let {valueA, valueB} = this.getItemsToSort(a,b);
    if(this.props.sortFn){
      return this.props.sortFn(valueA, valueB)
    }else{
      return this.defaultSortFn(valueA, valueB)
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
}

Column.propTypes = {
  name: PropTypes.string.isRequired,
  sortable: PropTypes.bool,
  sortFn: PropTypes.func,
  sortCb: PropTypes.func, //Internal use
  dataKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired
};

module.exports = Column;
