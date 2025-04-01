import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";

export default function Tipo() {
  const [age, setAge] = useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <FormControl
      sx={{
        m: 1,
        minWidth: 120,
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "primary.main",
            borderRadius: "8px",
          },
          "&:hover fieldset": {
            borderColor: "primary.dark",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
            borderWidth: "2px",
          },
        },
      }}
      size="small"
    >
      <InputLabel id="demo-select-small-label">Tipo</InputLabel>
      <Select
        labelId="demo-select-small-label"
        id="demo-select-small"
        value={age}
        label="Tipo"
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Renta</MenuItem>
        <MenuItem value={20}>Venta</MenuItem>
      </Select>
    </FormControl>
  );
}
