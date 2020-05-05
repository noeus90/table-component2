import React from "react";
import PropTypes from "prop-types";

class GlobalFilter extends React.Component {
  /* eslint-disable no-useless-constructor*/
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data
    };
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div>
        <input placeholder="Busqueda global" onChange={this.onChange} />
      </div>
    );
  }

  onChange(evt) {
    const value = evt.target.value;
    const filtered = this.props.data.filter(obj => {
      return this.props.keys.some(key => {
        //TODO mejorar para datos complejos
        let data;
        if (typeof key === "function") {
          data = key(obj) || "";
        } else {
          data = obj[key] || "";
        }
        
        return JSON.stringify(data)
          .toLowerCase()
          .includes(value.toLowerCase());
      });
    });
    this.props.onChange(filtered);
  }
}

GlobalFilter.propTypes = {
  data: PropTypes.array.isRequired
};

module.exports = GlobalFilter;
