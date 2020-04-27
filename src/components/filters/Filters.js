import React from "react";

class Filters {
  constructor(dataFn, applyFn) {
    this.filters = {};
    this.dataFn = dataFn;
    this.applyFn = applyFn;
    this._defaultOnchange = this._defaultOnchange.bind(this);
  }

  addFilter(column) {
    const {
      type,
      dataKey,
      name,
      filterView,
      filterFn,
      filtrable
    } = column.props;
    if (filtrable && !this.filters[name]) {
      this.filters[name] = this._getDefaultFilter(type, name);
      this.filters[name].key = dataKey;
      if (filterView) {
        this.filters[name].view = React.cloneElement(filterView, {
          onChange: constraint => this._defaultOnchange(constraint, name)
        });
      }
      if (filterFn) {
        this.filters[name].fn = filterFn;
      }
    } else if (!filtrable && this.filters[name]) {
      delete this.filters[name];
    }
  }

  getFilters() {
    return this.filters;
  }

  _getDefaultFilter(type, tag) {
    switch (type) {
      case "date":
        return (cellData, filter) => null;
      default:
        return {
          view: (
            <input
              placeholder={tag}
              onChange={constraint => this._defaultOnchange(constraint, tag)}
            />
          ),
          constraint: "",
          fn: (cellData, constraint) =>{
           return !constraint.value || !constraint.value.length || (cellData && cellData.includes(constraint.value))
          }
        };
    }
  }

  _defaultOnchange(constraint, tag) {
    this.filters[tag].constraint = constraint.target;
    this.filter();
  }

  filter() {
    this.dataFn().forEach(row => {
      row.extra.visible = Object.values(this.filters).every(filter => {
        const { key, fn, constraint } = filter;
        const value = typeof key === "function" ? key(row.row) : row.row[key];
        return fn(value, constraint);
      });
    });
    this.applyFn();
  }
}

module.exports = Filters;
