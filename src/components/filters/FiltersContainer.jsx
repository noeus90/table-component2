import React from "react";
import PropTypes from "prop-types";

class FiltersContainer extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    console.log(props)
  }

  render() {
    return (
      <table className={this.props.visible ? "filterContainer" :"hide"}>
         <tr>
          {Object.values(this.props.filters.global).map((f, i) => {
            return (
              <td key={"td"+i}>
                {f.view}
              </td>
            );
          })}
        </tr>
        <tr>
          {this.props.widths.map((w, i) => {
            if(this.props.columns[i] && !this.props.columns[i].extra.visible) return null;
            return (
              <td style={{ width: w }} key={"td"+i}>
                {this.props.columns[i] && this.props.columns[i].extra.filtrable() &&
                  this.props.filters.column[this.props.columns[i].name].view}
              </td>
            );
          })}
        </tr>
      </table>
    );
  }
}

FiltersContainer.propTypes = {
  visible: PropTypes.bool.isRequired,
  columns: PropTypes.array.isRequired
};

module.exports = FiltersContainer;
