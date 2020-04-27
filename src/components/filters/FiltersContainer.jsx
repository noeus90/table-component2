import React from "react";
import PropTypes from "prop-types";

class FiltersContainer extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    console.log(this.props.columns[0].props);
  }

  render() {
    if (!this.props.visible) return null;
    return (
      <table>
        <tr>
          {this.props.widths.map((w, i) => {
            return (
              <td style={{ width: w }} key={"td"+i}>
                {this.props.columns[i] && this.props.columns[i].props.filtrable &&
                  this.props.filters[this.props.columns[i].props.name].view}
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
