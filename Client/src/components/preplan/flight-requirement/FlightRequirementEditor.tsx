import React, { FC, useState, useEffect, Fragment } from 'react';
import {
  Theme,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Typography,
  Grid,
  IconButton,
  Switch,
  FormControlLabel,
  Checkbox
} from '@material-ui/core';
import { Clear as ClearIcon, Add as AddIcon, CheckBox } from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/styles';
import { Scope } from '@babel/traverse';
import { FlightRequirementModal } from 'src/pages/preplan';
import Weekday from '@core/types/Weekday';
import { FlightTime } from 'src/view-models/FlightRequirement';
import DaysPicker from 'src/components/DaysPicker';
import classNames from 'classnames';
import MasterData from '@core/master-data';

const useStyles = makeStyles((theme: Theme) => ({
  allowTimeStyle: {
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: 4
  },
  gridStyle: {
    matgin: theme.spacing(0, 0, 2, 0)
  },
  captionTextColor: {
    color: theme.palette.grey[500]
  }
}));

// Public definitions:
// export interface SomeExtraDefinitions {}

// // Internal definitions:
// interface SomeOtherExtraDefinitions {}

type modeType = 'add' | 'edit' | 'readOnly' | 'return';

const titleMessage = {
  add: 'What is the new flight requierment?',
  edit: 'Edit flight requierment',
  readOnly: 'Flight requierment',
  return: 'What is the return flight requierment?'
};

// Component props type:
export interface FlightRequirementEditorProps {
  model: FlightRequirementModal;
  mode: modeType;
  onSave?: (model?: FlightRequirementModal) => void;
  selectedDay?: Weekday;
}

// Component body:
const FlightRequirementEditor: FC<FlightRequirementEditorProps> = ({ model, mode, onSave, selectedDay }) => {
  if (mode === 'add') {
    model = {} as FlightRequirementModal;
  }

  const stc = MasterData.all.stcs.items;
  model.times = model.times || ([] as FlightTime[]);
  model.times.push({} as FlightTime);

  const [flightRequirement, setFlightRequirement] = useState<FlightRequirementModal>(model);
  //const scope = selectedDay ? flightRequirement.Days. : flightRequirement.scope;

  // All state or reducer hooks:

  const classes = useStyles();
  // All third party hooks:

  // All functions with inner use:

  // Make the virtual DOM:
  return (
    <Fragment>
      <DialogTitle id="form-dialog-title">{titleMessage[mode]}</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.captionTextColor}>
                  Flight Information
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Label" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Flight Number" />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Departure" />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Arrival" />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Block Time" />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container className={classNames(classes.allowTimeStyle)} spacing={2}>
              <IconButton
                onClick={() => {
                  var temp = { ...flightRequirement };
                  temp.times = temp.times && [...temp.times];
                  temp.times && temp.times.push({} as FlightTime);
                  setFlightRequirement(temp);
                }}
              >
                <AddIcon />
              </IconButton>
              {flightRequirement &&
                flightRequirement.times &&
                flightRequirement.times.map((t, index) => {
                  return (
                    <Fragment key={index}>
                      <Grid item xs={4}>
                        <TextField fullWidth label="STD Lower Bound">
                          {t.stdLowerBound}
                        </TextField>
                      </Grid>
                      <Grid item xs={4}>
                        <TextField fullWidth label="STD Upper Bound">
                          {t.stdUpperBound}
                        </TextField>
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() => {
                            var temp = { ...flightRequirement };
                            temp.times = temp.times && temp.times.filter(r => r != t);

                            setFlightRequirement(temp);
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      </Grid>
                    </Fragment>
                  );
                })}
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.captionTextColor}>
                  Allowed Aircrafts
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Include Aircraft" />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Exclude Aircraft" />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className={classes.captionTextColor}>
                  Days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className={classes.captionTextColor}>
                  Options
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Grid item>
                  <DaysPicker />
                </Grid>
              </Grid>
              <Grid item container xs={6}>
                <Grid item xs={6}>
                  <Typography variant="body2">Requierd</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Switch color="primary" />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" className={classes.captionTextColor}>
                  Extra Information
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <TextField label="STC" />
                {/* <ItemPicker sources={stc} fieldName="name" label="STC" /> */}
              </Grid>
              <Grid item xs={3}>
                <FormControlLabel control={<Checkbox color="primary" />} label="Slot" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Comment" />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button color="primary">Cancel</Button>
        <Button onClick={() => onSave && onSave(flightRequirement)} color="primary">
          add
        </Button>
      </DialogActions>
    </Fragment>
  );
};

// Default values of props when not provided by the user (only for optional props):

// Export the component as the default export:
export default FlightRequirementEditor;

// Any other extra helpers: