import React, { useEffect } from "react";
import Select from "react-select";

function SelectComp(props) {
  var { options, val, handleChange } = props;

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
