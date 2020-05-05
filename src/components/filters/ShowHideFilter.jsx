import React from "react";
import PropTypes from "prop-types";

class ShowHideFilter extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    this.state = {
      checked: []
    };
    //console.log(props);
  }

  render() {
    return (
      <div>
        Hide => (
        {this.props.columns.map((c, i) => (
          <label key={"c" + i}>
            {c}
            <input
              type="checkbox"
              checked={this.state.checked[i]}
              value={this.state.checked[i]}
              onChange={evt => {
                const checked = this.state.checked;
                checked[i] = evt.target.checked;
                this.setState({ checked: checked }, () =>
                  this.props.onChange(this.state.checked)
                );
              }}
            />
          </label>
        ))}
        )
      </div>
    );
  }
}

ShowHideFilter.propTypes = {
  columns: PropTypes.array.isRequired,
  onChange: PropTypes.func
};

module.exports = ShowHideFilter;
