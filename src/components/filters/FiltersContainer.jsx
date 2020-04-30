import React from "react";
import PropTypes from "prop-types";

class FiltersContainer extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    //console.log(props)
  }

  render() {
    return (
      <div
        className={"table " + this.props.visible ? "filterContainer" : "hide"}
      >
        <div className="row">
          {Object.values(this.props.filters.global).map((f, i) => {
            return <div key={"td" + i}>{f.view}</div>;
          })}
        </div>
        <div className="row">
          {this.props.widths.map((w, i) => {
            if (this.props.columns[i] && !this.props.columns[i].extra.visible)
              return null;
            return (
              <div className="cell" style={{ width: w }} key={"td" + i}>
                {this.props.columns[i] &&
                  this.props.columns[i].extra.filtrable() &&
                  this.props.filters.column[this.props.columns[i].name].view}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

FiltersContainer.propTypes = {
  visible: PropTypes.bool.isRequired,
  columns: PropTypes.array.isRequired
};

module.exports = FiltersContainer;
