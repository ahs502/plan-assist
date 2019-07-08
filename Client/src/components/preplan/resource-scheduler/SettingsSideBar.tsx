import React, { FC, useState } from 'react';
import { Theme, Typography, FormControl, Select, TextField, InputLabel } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import SideBarContainer from './SideBarContainer';
import MinimumGroundTimeMode from '@core/types/auto-arranger-options/MinimumGroundTimeMode';
import AutoArrangerOptionsModel from '@core/models/AutoArrangerOptionsModel';
import AutoArrangerOptions from 'src/view-models/AutoArrangerOptions';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    marginTop: theme.spacing(2)
  },
  selectStyle: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(5)
  },
  textFieldStyle: {
    paddingLeft: theme.spacing(1)
  }
}));

const minimumGroundTimeModes: readonly { value: MinimumGroundTimeMode; label: string }[] = [
  { value: 'MINIMUM', label: 'Minimum' },
  { value: 'MAXIMUM', label: 'Maximum' },
  { value: 'AVERAGE', label: 'Average' }
];

export interface SettingsSideBarProps {
  autoArrangerOptions: AutoArrangerOptions;
  onApply: (autoArrangerOptions: AutoArrangerOptionsModel) => void;
}

const SettingsSideBar: FC<SettingsSideBarProps> = ({ autoArrangerOptions, onApply }) => {
  const [minimumGroundTimeMode, setMinimumGroundTimeMode] = useState(autoArrangerOptions.minimumGroundTimeMode);
  const [minimumGroundTimeOffset, setMinimumGroundTimeOffset] = useState(autoArrangerOptions.minimumGroundTimeOffset);

  const classes = useStyles();

  return (
    <SideBarContainer
      label="Auto-Arranger Options"
      onApply={() => {
        const autoArrangerOptions: AutoArrangerOptionsModel = { minimumGroundTimeMode, minimumGroundTimeOffset };
        onApply(autoArrangerOptions);
      }}
    >
      <Typography variant="body1">Minimum Ground Time</Typography>
      <FormControl fullWidth className={classes.formControl}>
        <InputLabel htmlFor="age-native-simple">Mode</InputLabel>
        <Select
          classes={{ select: classes.selectStyle }}
          native
          variant="outlined"
          value={minimumGroundTimeMode}
          onChange={e => setMinimumGroundTimeMode(e.target.value as MinimumGroundTimeMode)}
        >
          {minimumGroundTimeModes.map(mode => (
            <option key={mode.value} value={mode.value}>
              {mode.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth className={classes.formControl}>
        <TextField
          type="number"
          label="Offset"
          value={minimumGroundTimeOffset}
          onChange={e => setMinimumGroundTimeOffset(Number(e.target.value))}
          InputProps={{
            className: classes.textFieldStyle
          }}
        />
      </FormControl>
    </SideBarContainer>
  );
};

export default SettingsSideBar;
