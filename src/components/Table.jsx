import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";
import Column from "./Column";

class Table extends React.Component {
  constructor(props) {
    super(props);
    //console.log(props);

    this.state = {
      rows: this.props.data,
      customAfterRow: []
    };
    this.sort = this.sort.bind(this);
    this.buildActions = this.buildActions.bind(this);
    this.openAfterRow = this.openAfterRow.bind(this);
    this.buildUtils = this.buildUtils.bind(this);
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
    return this.props.children.map(child => {
      const modifier = this.props.actions ? 0.95 : 1;
      const percentage = ((child.props.weight || 1) * 100) / weightSum;
      return percentage * modifier + "%";
    });
  }

  render() {
    const widths = this.calculateWidths();
    return (
      <div className="tableContainer">
        <table>
          <thead>
            <tr>
              {this.props.children.map((column, i) => {
                return React.cloneElement(column, {
                  width: widths[i],
                  sortCb: this.sort
                });
              })}
              {this.props.actions && (
                <Column key="actions + i" name={" "} width={"5%"} />
              )}
            </tr>
          </thead>
          <tbody className={this.props.stickyHeader ? "scrollable" : ""}>
            {this.state.rows.map((rowData, i) => {
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
                      <Cell key={i + "-" + j} value={value} width={widths[j]} />
                    );
                  })}
                  {this.props.actions && this.buildActions(rowData, i)}
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

  buildActions(rowData, rowIdx) {
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
        width={"5%"}
      />
    );
  }

  sort(sortFn, asc = true) {
    this.setState({
      rows: this.state.rows.sort(asc ? sortFn : (a, b) => sortFn(b, a))
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
      visible: PropTypes.oneOf([PropTypes.func, PropTypes.bool]),
      enabled: PropTypes.oneOf([PropTypes.func, PropTypes.bool]),
      action: PropTypes.func.isRequired
    })
  ).isRequired
};

module.exports = Table;
