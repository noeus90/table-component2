import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";
import Column from "./Column";
import Filters from "./filters/Filters";
import FiltersContainer from "./filters/FiltersContainer";
import ShowHideFilter from "./filters/ShowHideFilter";

class Table extends React.Component {
  constructor(props) {
    super(props);
    //console.log(props);

    this.state = {
      rows: [],
      cols: props.children.map((column, i) => ({
        name: column.props.name,
        extra: {
          visible: true,
          filtrable: () => this.props.children[i].props.filtrable
        }
      })),
      customAfterRow: [],
      showFilters: false,
      pageSize: this.props.pagination.pageSize || 2,
      currentPage: 0
    };
    this.sort = this.sort.bind(this);
    this.buildActions = this.buildActions.bind(this);
    this.openAfterRow = this.openAfterRow.bind(this);
    this.buildUtils = this.buildUtils.bind(this);
    this.filters = new Filters(() => this.state.rows, () => this.forceUpdate());
  }

  recursive = () => {
    setTimeout(() => {
      let hasMore = this.state.rows.length + 1 < this.props.data.length;
      this.setState((prev, props) => ({
        rows: props.data.slice(0, prev.rows.length + 1).map(row => ({
          row: row,
          extra: { visible: true }
        }))
      }));
      if (hasMore) this.recursive();
    }, 0);
  };

  componentDidMount() {
    this.recursive();
  }

  calculateWeightSum() {
    let weightSum = 0;
    this.props.children.forEach(
      child => (weightSum += child.props.weight || 1)
    );
    if (!weightSum) weightSum = this.props.children.length;
    return weightSum;
  }

  calculateWidths() {
    const weightSum = this.calculateWeightSum();
    const widths = this.props.children.map(child => {
      const modifier = this.props.actions ? 0.95 : 1;
      const percentage = ((child.props.weight || 1) * 100) / weightSum;
      return percentage * modifier + "%";
    });
    if (this.props.actions) {
      widths.push("5%");
    }
    return widths;
  }

  render() {
    const pages = Math.ceil(this.props.data.length / this.state.pageSize);
    const widths = this.calculateWidths();
    this.props.children.forEach(column => {
      this.filters.addFilter(column.props);
    });
    this.filters.addFilter({
      type: "text",
      name: "Hide columns",
      filterView: (
        <ShowHideFilter columns={this.props.children.map(c => c.props.name)} />
      ),
      filterFn: (rows, constraint) => {
        this.state.cols.forEach(
          (col, i) => (col.extra.visible = !constraint[i])
        );
        return true;
      },
      filtrable: true
    });
    return (
      <div className="tableContainer">
        <p className={this.props.pagination ? "" : "hide"}>
          <label>
            Rows per page:{" "}
            <input
              type="number"
              value={this.state.pageSize}
              onChange={evt =>
                this.setState({ pageSize: parseInt(evt.target.value, 10) })
              }
              style={{ width: "40px" }}
            />
          </label>{" "}
          <label>
            Page:{" "}
            <button
              onClick={evt =>
                this.setState({
                  currentPage:
                    this.state.currentPage && this.state.currentPage - 1
                })
              }
            >
              {"<"}
            </button>
            {this.state.currentPage + 1 + "/" + pages}
            <button
              onClick={evt =>
                this.state.currentPage + 1 < pages &&
                this.setState({ currentPage: this.state.currentPage + 1 })
              }
            >
              {">"}
            </button>
          </label>
        </p>
        <p>
          <label>
            Filtros{" "}
            <input
              type="checkbox"
              value={this.state.showFilters}
              onChange={evt =>
                this.setState({ showFilters: evt.target.checked })
              }
            />
          </label>
        </p>

        {
          <FiltersContainer
            visible={this.state.showFilters}
            columns={this.state.cols}
            filters={this.filters.getFilters()}
            widths={widths}
          />
        }

        <table className="visibleRows">
          <thead>
            <tr>
              {this.props.children.map((column, i) => {
                return React.cloneElement(column, {
                  key: column.props.dataKey,
                  width: widths[i],
                  sortCb: this.sort,
                  visible: this.state.cols[i].extra.visible
                });
              })}
              {this.props.actions && (
                <Column
                  key="actions + i"
                  name={" "}
                  width={widths[widths.length - 1]}
                />
              )}
            </tr>
          </thead>
          <tbody className={this.props.stickyHeader ? "scrollable" : ""}>
            {this.state.rows.map((row, i) => {
              if (
                this.props.pagination &&
                i < this.state.currentPage * this.state.pageSize
              )
                return null;
              if (
                this.props.pagination &&
                i + 1 >
                  this.state.currentPage * this.state.pageSize +
                    this.state.pageSize
              )
                return null;
              if (!row.extra.visible) return null;
              const rowData = row.row;
              return [
                <tr
                  key={i}
                  className={this.props.zebraStyle && i % 2 ? "green" : "white"}
                >
                  {this.props.children.map((column, j) => {
                    //console.log(rowData);
                    let value;

                    if (typeof column.props.dataKey === "function") {
                      value = column.props.dataKey(rowData);
                    } else {
                      value = rowData[column.props.dataKey];
                    }

                    if (column.props.treatment) {
                      value = column.props.treatment(value);
                    }
                    return (
                      <Cell
                        key={i + "-" + j}
                        className={this.props.rowDensity}
                        value={value}
                        width={widths[j]}
                        visible={this.state.cols[j].extra.visible}
                      />
                    );
                  })}
                  {this.props.actions &&
                    this.buildActions(rowData, i, widths[widths.length - 1])}
                </tr>,
                this.state.customAfterRow[i] ? (
                  <tr>
                    <Cell
                      key={"AR"}
                      className="afterRow"
                      colSpan={3}
                      value={
                        <div>
                          {typeof this.state.customAfterRow[i] === "function"
                            ? this.state.customAfterRow[i](rowData)
                            : this.state.customAfterRow[i]}
                        </div>
                      }
                    />
                  </tr>
                ) : null
              ];
            })}
          </tbody>
        </table>
      </div>
    );
  }

  openAfterRow(rowIdx, newAfterRow) {
    const afterRow = newAfterRow || this.props.afterRow;
    const arr = this.state.customAfterRow;
    if (!arr[rowIdx]) {
      arr[rowIdx] = afterRow;
    } else {
      arr[rowIdx] = false;
    }
    const newState = { customAfterRow: arr };
    this.setState(newState);
  }

  closeAfterRow(rowIdx) {
    const arr = this.state.customAfterRow;
    arr[rowIdx] = false;
    const newState = { customAfterRow: arr };
    this.setState(newState);
  }

  buildUtils(rowIdx) {
    return {
      openAfterRow: newAfterRow => this.openAfterRow(rowIdx, newAfterRow),
      closeAfterRow: () => this.closeAfterRow(rowIdx)
    };
  }

  buildActions(rowData, rowIdx, width) {
    return (
      <Cell
        key={"actions" + rowIdx}
        value={
          <div className="dropup">
            <button className="dropbtn">⋮</button>
            <div className="dropup-content">
              {this.props.actions.reduce((result, action, i) => {
                let visible;
                switch (typeof action.visible) {
                  case "function":
                    visible = action.visible(rowData);
                    break;
                  case "boolean":
                    visible = action.visible;
                    break;
                  default:
                    visible = true;
                }

                if (visible) {
                  let enabled;
                  switch (typeof action.enabled) {
                    case "function":
                      enabled = action.enabled(rowData);
                      break;
                    case "boolean":
                      enabled = action.visible;
                      break;
                    default:
                      enabled = true;
                  }

                  return result.concat(
                    <p
                      key={"action" + i}
                      style={enabled ? {} : { color: "gray" }}
                      onClick={() =>
                        enabled &&
                        action.action(rowData, this.buildUtils(rowIdx))
                      }
                      className="mini"
                    >
                      {action.icon} {action.text}
                    </p>
                  );
                }
                return result;
              }, [])}
            </div>
          </div>
        }
        width={width}
      />
    );
  }

  sort(sortFn, asc = true) {
    this.setState({
      rows: this.state.rows.sort(
        asc ? (a, b) => sortFn(a.row, b.row) : (a, b) => sortFn(b.row, a.row)
      )
    });
  }
}

Table.propTypes = {
  data: PropTypes.array.isRequired,
  stickyHeader: PropTypes.bool,
  zebraStyle: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      icon: PropTypes.string,
      visible: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
      enabled: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
      action: PropTypes.func.isRequired
    })
  ).isRequired
};

module.exports = Table;
