import React from "react";
import PropTypes from "prop-types";

class Cell extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    //console.log(this.props)
  }

  render() {
    if (!this.props.visible) return null;
    return (
      <td className={this.props.className} style={{ width: this.props.width }}>
          {this.props.value}
      </td>
    );
  }
}

Cell.propTypes = {
  value: PropTypes.any.isRequired,
  visible: PropTypes.bool
};

module.exports = Cell;
