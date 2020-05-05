import React from "react";
import PropTypes from "prop-types";
import Cell from "./Cell";

class Row extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    this.buildActions = this.buildActions.bind(this);
  }

  render() {
    const { data, widths, index, color } = this.props;
    const rowData = data,
      i = index;
    return (
      <div key={i} className={"row " + color} draggable>
        {this.props.children.map((column, j) => {
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
              visible={this.props.cols[j].extra.visible}
            />
          );
        })}
        {this.props.actions &&
          this.buildActions(rowData, i, widths[widths.length - 1])}
      </div>
    );
  }

  buildActions(rowData, rowIdx, width) {
    return (
      <Cell
        key={"actions" + rowIdx}
        visible={true}
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
                        action.action(rowData, this.props.buildUtils(rowIdx))
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
}

Row.propTypes = {
  data: PropTypes.object.isRequired,
  widths: PropTypes.array,
  index: PropTypes.number,
  rowColor: PropTypes.string,
  rowDensity: PropTypes.string
};

module.exports = Row;
