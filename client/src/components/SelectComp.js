import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";

function SelectComp(props) {
  var { options, val, handleChange } = props;

  SelectComp.propTypes = {
    options: PropTypes.array.isRequired,
    val: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
  };

  useEffect(() => {}, [val]);

  return (
    <Select
      options={options}
      value={val ? val : null}
      onChange={handleChange}
    />
  );
}

export default SelectComp;
