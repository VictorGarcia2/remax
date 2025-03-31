import { FormControl, Input, InputLabel, Stack } from "@mui/material";
import React, { useState } from "react";
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(#00) 000-0000"
      definitions={{
        '#': /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

TextMaskCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default function RangoDePrecio() {
  const [values, setValues] = useState({
    textmask: '(100) 000-0000',
    numberformat: '1320',
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Stack direction="row" spacing={2}>
      <FormControl variant="standard">
        <InputLabel htmlFor="formatted-text-mask-input">react-imask</InputLabel>
        <Input
          value={values.textmask}
          onChange={handleChange}
          name="textmask"
          id="formatted-text-mask-input"
          inputComponent={TextMaskCustom}
        />
      </FormControl>
      <NumericFormat
        value={values.numberformat}
        onChange={handleChange}
        customInput={TextField}
        thousandSeparator
        valueIsNumericString
        prefix="$"
        variant="standard"
        label="react-number-format"
      />
    </Stack>
  );
}
