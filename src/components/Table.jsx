import React from "react";
import PropTypes from "prop-types";
import Row from "./Row";
import Cell from "./Cell";
import Column from "./Column";
import Filters from "./filters/Filters";
import FiltersContainer from "./filters/FiltersContainer";
import ShowHideFilter from "./filters/ShowHideFilter";
import { FixedSizeList as List } from "react-window";
import Measure from "react-measure";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move";

const SortableItem = SortableElement(({ children }) => children);
const SortableList = SortableContainer(({ children }) => children);

class Table extends React.Component {
  constructor(props) {
    super(props);
    //console.log(props);

    this.state = {
      rows: props.data.map(row => ({
        row: row,
        extra: { visible: true }
      })),
      cols: props.children.map((column, i) => ({
        name: column.props.name,
        extra: {
          visible: true,
          filtrable: () => this.props.children[i].props.filtrable
        }
      })),
      order: props.children.map((_, index) => index),
      customAfterRow: [],
      showFilters: false,
      pageSize: this.props.pagination.pageSize || 2,
      currentPage: 0,
      width: 0,
      interval: null
    };
    this.sort = this.sort.bind(this);
    this.filters = new Filters(() => this.state.rows, () => this.forceUpdate());
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
    this.openAfterRow = this.openAfterRow.bind(this);
    this.buildUtils = this.buildUtils.bind(this);
    this.loadRows = this.loadRows.bind(this);
    this.onSortEnd = this.onSortEnd.bind(this);
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    let fun = (a, posI, posF) => {
      const max = Math.max(posI, posF);
      const min = Math.min(posI, posF);
      const inc = posF < posI ? 1 : -1;
      return a.map(x => {
        if (x > max || x < min) {
          return x;
        }
        if (x === posI) {
          return posF;
        }
        return x + inc;
      });
    };

    this.setState(oldState => ({
      ...oldState,
      order: fun(oldState.order, oldIndex, newIndex)
    }));
  };

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
    //this.recursive();
    this.setState({
      width: this.container.offsetWidth,
      height: this.container.offsetHeight
    });
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

  loadRows() {
    if (!this.state.interval) {
      this.setState({
        interval: setInterval(() => {
          const rows = this.state.rows;
          const idx = Math.floor(Math.random() * rows.length);
          //rows.splice(0, 0, rows[idx]);
          const newObj = {};
          Object.assign(newObj, rows[idx]);
          newObj.extra.visible = true;
          rows.push(newObj);
          this.setState({ rows: rows }, this.filters.filter());
        }, 10)
      });
    } else {
      clearInterval(this.state.interval);
      this.setState({ interval: null });
    }
  }

  render() {
    const pages = Math.ceil(this.props.data.length / this.state.pageSize);
    const widths = this.calculateWidths();
    const itemHeight =
      18 +
      (this.props.rowDensity === "default"
        ? 20
        : this.props.rowDensity === "compact"
        ? 10
        : 30);

    //TODO: Mover esto al estado
    const sortedChildren = this.props.children
      .map((value, index) => [value, this.state.order[index]])
      .sort((m1, m2) => m1[1] - m2[1])
      .map(m => m[0]);

    const sortedCols = this.state.cols
      .map((value, index) => [value, this.state.order[index]])
      .sort((m1, m2) => m1[1] - m2[1])
      .map(m => m[0]);
    sortedChildren.forEach(column => {
      this.filters.addFilter(column.props);
    });

    return (
      <div className="tableContainer">
        <div className="table">
          <button onClick={this.loadRows}>
            {this.state.interval ? "Stop " : "Start "}loading rows
          </button>{" "}
          Rows: {this.state.rows.length} Filtered:{" "}
          {this.state.rows.filter(r => r.extra.visible).length}{" "}
        </div>
        <Measure bounds onResize={d => this.setState({ width: d.width })}>
          {({ contentRect, measureRef }) => <div ref={measureRef} />}
        </Measure>
        <div ref={el => (this.container = el)} />
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

        {
          <FiltersContainer
            visible={true}
            columns={sortedCols}
            filters={this.filters.getFilters()}
            widths={widths}
          />
        }

        <div className={"table " + (this.props.stickyHeader && "scrollable")}>
          <div>
            <SortableList onSortEnd={this.onSortEnd} axis={"x"}>
              <div className="row">
                {sortedChildren.map((column, i) => {
                  const children = React.cloneElement(column, {
                    key: column.props.dataKey,
                    width: widths[i],
                    sortCb: this.sort,
                    visible: this.state.cols[i].extra.visible,
                    rowDensity: this.props.rowDensity
                  });
                  return (
                    <SortableItem key={column.props.dataKey} index={i}>
                      {children}
                    </SortableItem>
                  );
                })}
                {this.props.actions && (
                  <SortableItem
                    index={this.props.children.length}
                    disabled={true}
                  >
                    <Column
                      key="actions + i"
                      visible={true}
                      name={" "}
                      width={widths[widths.length - 1]}
                      rowDensity={this.props.rowDensity}
                    />
                  </SortableItem>
                )}
              </div>
            </SortableList>
          </div>
          <List
            className="List"
            height={230}
            itemCount={
              this.props.pagination
                ? this.state.pageSize
                : this.state.rows.filter(r => r.extra.visible).length
            }
            itemSize={itemHeight}
            width={this.state.width}
          >
            {({ index, style }) => {
              const rows = this.state.rows.filter(r => r.extra.visible);
              const row = this.props.pagination
                ? rows[this.state.currentPage * this.state.pageSize + index]
                : rows[index];
              const rowData = row.row;
              return (
                <div className={row} style={style}>
                  <Row
                    data={rowData}
                    widths={widths}
                    index={index}
                    color={
                      this.props.zebraStyle && index % 2 ? "green" : "white"
                    }
                    children={sortedChildren}
                    cols={sortedCols}
                    afterRows={this.state.customAfterRow}
                    actions={this.props.actions}
                    buildUtils={this.buildUtils}
                    rowDensity={this.props.rowDensity}
                  />

                  {this.state.customAfterRow[index] && (
                    <div
                      className={
                        this.props.zebraStyle && index % 2 ? "green" : "white"
                      }
                    >
                      <Cell
                        key={"AR"}
                        visible={true}
                        className="afterRow"
                        colSpan={3}
                        value={
                          <div>
                            {typeof this.state.customAfterRow[index] ===
                            "function"
                              ? this.state.customAfterRow[index](rowData)
                              : this.state.customAfterRow[index]}
                          </div>
                        }
                      />
                    </div>
                  )}
                </div>
              );
            }}
          </List>
        </div>
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
