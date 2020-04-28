import React from "react";

class Filters {
  constructor(dataFn, applyFn) {
    this.filters = { column: {}, global: {} };
    this.dataFn = dataFn;
    this.applyFn = applyFn;
    this._defaultOnchange = this._defaultOnchange.bind(this);
  }

  addFilter(params) {
    const { type, dataKey, name, filterView, filterFn, filtrable } = params;
    const group = dataKey ? "column" : "global";
    if (filtrable && !this.filters[group][name]) {
      this.filters[group][name] = this._getDefaultFilter(type, name);
      if (dataKey) this.filters[group][name].key = dataKey;
      if (filterFn) this.filters[group][name].fn = filterFn;
      if (filterView)
        this.filters[group][name].view = React.cloneElement(filterView, {
          onChange: constraint =>
            this._defaultOnchange(constraint, name, group)
        });

    } else if (!filtrable && this.filters[group][name]) {
      delete this.filters[group][name];
    }
  }

  getFilters() {
    return this.filters; //TODO distingir filtros globales de columna
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
              onChange={constraint =>
                this._defaultOnchange(constraint, tag, "column")
              }
            />
          ),
          constraint: "",
          fn: (cellData, constraint) => {
            return (
              !constraint.value ||
              !constraint.value.length ||
              (cellData && cellData.includes(constraint.value))
            );
          }
        };
    }
  }

  _defaultOnchange(constraint, tag, group) {
    this.filters[group][tag].constraint = constraint.target || constraint;
    this.filter();
  }

  filter() {
    this.dataFn().forEach(row => {
      row.extra.visible = Object.values(this.filters.global).every(filter => {
        const { key, fn, constraint } = filter;
        const value = typeof key === "function" ? key(row.row) : row.row[key];
        return fn(value, constraint);
      });
      row.extra.visible =
        row.extra.visible &&
        Object.values(this.filters.column).every(filter => {
          const { key, fn, constraint } = filter;
          const value = typeof key === "function" ? key(row.row) : row.row[key];
          return fn(value, constraint);
        });
    });
    this.applyFn();
  }
}

module.exports = Filters;
