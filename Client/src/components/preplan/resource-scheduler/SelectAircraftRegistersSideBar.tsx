import React, { FC, useState, Fragment, useContext } from 'react';
import { Theme, Table, TableHead, TableBody, TableCell, TableRow, Typography, TextField, IconButton, FormControl, Select, Collapse } from '@material-ui/core';
import { Clear as RemoveIcon, Check as CheckIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import MasterData, { AircraftType } from '@core/master-data';
import Search, { filterOnProperties } from 'src/components/Search';
import useProperty from 'src/utils/useProperty';
import AircraftRegisterOptionsStatus from '@core/types/AircraftRegisterOptionsStatus';
import DummyAircraftRegisterModel from '@core/models/preplan/DummyAircraftRegisterModel';
import AircraftRegisterOptionsModel from '@core/models/preplan/AircraftRegisterOptionsModel';
import { PreplanContext } from 'src/pages/preplan';
import SideBarContainer from 'src/components/preplan/resource-scheduler/SideBarContainer';
import { formFields } from 'src/utils/FormField';
import RefiningTextField from 'src/components/RefiningTextField';

const useStyles = makeStyles((theme: Theme) => ({
  searchWrapper: {
    margin: theme.spacing(0, 0, 5, 0)
  },
  nameCell: {
    width: 80
  },
  baseAirportCell: {
    width: 90
  },
  stateCell: {
    width: 130
  },
  select: {
    width: '100%',
    paddingRight: 0
  },
  backupRegister: {
    backgroundColor: theme.palette.extraColors.backupRegister
  },
  ignoredRegister: {
    backgroundColor: theme.palette.extraColors.ignoredRegister
  },
  content: {
    height: `calc(100%)`
  },
  body: {
    height: `calc(100% - 82px)`,
    overflow: 'auto'
  },
  bodyWithAddDummy: {
    height: `calc(100% - 188px)`,
    overflow: 'auto'
  }
}));

type ViewState = AircraftRegistersPerTypeViewState[];
interface AircraftRegistersPerTypeViewState {
  type: AircraftType;
  registers: AircraftRegisterViewState[];
  dummyRegisters: DummyAircraftRegisterViewState[];
}
interface AircraftRegisterViewState {
  id: string;
  name: string;
  groups: string[];
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}
interface DummyAircraftRegisterViewState {
  id: string;
  name: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}

interface AddDummyAircraftRegisterFormState {
  show: boolean;
  name: string;
  aircraftType: string;
  baseAirport: string;
  status: AircraftRegisterOptionsStatus;
}

const aircraftRegisterOptionsStatusList: readonly { value: AircraftRegisterOptionsStatus; label: string }[] = [
  { value: 'IGNORED', label: 'Ignored' },
  { value: 'BACKUP', label: 'Backup' },
  { value: 'INCLUDED', label: 'Included' }
];

export interface SelectAircraftRegistersSideBarProps {
  initialSearch?: string;
  onApply(dummyAircraftRegisters: readonly DummyAircraftRegisterModel[], aircraftRegisterOptions: AircraftRegisterOptionsModel): void;
  loading?: boolean;
  errorMessage?: string;
}

const SelectAircraftRegistersSideBar: FC<SelectAircraftRegistersSideBarProps> = ({ initialSearch, onApply, loading, errorMessage }) => {
  const preplan = useContext(PreplanContext);

  const dummyAircraftRegisterIdCounter = useProperty(() => Math.max(0, ...preplan.aircraftRegisters.items.filter(r => r.dummy).map(r => Number(r.id.replace('dummy-', '')))));

  const [query, setQuery] = useState<readonly string[]>([]);
  const [list, setList] = useState<ViewState>(() =>
    MasterData.all.aircraftTypes.items.orderBy('displayOrder').map<AircraftRegistersPerTypeViewState>(t => ({
      type: t,
      registers: preplan.aircraftRegisters.items
        .filter(a => !a.dummy && a.aircraftType.id === t.id)
        .map<AircraftRegisterViewState>(a => ({
          id: a.id,
          name: a.name,
          groups: MasterData.all.aircraftRegisterGroups.items.filter(g => g.aircraftRegisters.filter(r => r.id === a.id)).map(g => g.name),
          baseAirport: a.options.baseAirport === undefined ? '' : formFields.airport.format(a.options.baseAirport),
          status: a.options.status
        })),
      dummyRegisters: preplan.aircraftRegisters.items
        .filter(a => a.dummy && a.aircraftType.id === t.id)
        .map<DummyAircraftRegisterViewState>(a => ({
          id: a.id,
          name: a.name,
          baseAirport: a.options.baseAirport === undefined ? '' : formFields.airport.format(a.options.baseAirport),
          status: a.options.status
        }))
    }))
  );
  const [addDummyRegisterFormState, setAddDummyRegisterFormState] = useState<AddDummyAircraftRegisterFormState>(() => ({
    show: false,
    name: '',
    aircraftType: '',
    baseAirport: '',
    status: 'INCLUDED'
  }));

  const classes = useStyles();

  const addDummyRegisterForm = (
    <Collapse in={addDummyRegisterFormState.show}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="body2">Reg.</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">Type</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2" align="left">
                Base
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">State</Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow
            className={classNames({
              [classes.backupRegister]: addDummyRegisterFormState.status === 'BACKUP',
              [classes.ignoredRegister]: addDummyRegisterFormState.status === 'IGNORED'
            })}
            hover={true}
          >
            <TableCell className={classes.nameCell}>
              <RefiningTextField
                formField={formFields.label}
                value={addDummyRegisterFormState.name}
                onChange={({ target: { value: name } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, name })}
              />
            </TableCell>
            <TableCell>
              <RefiningTextField
                formField={formFields.aircraftType}
                value={addDummyRegisterFormState.aircraftType}
                onChange={({ target: { value: aircraftType } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, aircraftType })}
              />
            </TableCell>
            <TableCell className={classes.baseAirportCell}>
              <RefiningTextField
                formField={formFields.airport}
                value={addDummyRegisterFormState.baseAirport}
                onChange={({ target: { value: baseAirport } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, baseAirport })}
              />
            </TableCell>
            <TableCell className={classes.stateCell}>
              <FormControl fullWidth>
                <Select
                  classes={{ select: classes.select }}
                  native
                  variant="outlined"
                  value={addDummyRegisterFormState.status}
                  onChange={({ target: { value: status } }) => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, status: status as AircraftRegisterOptionsStatus })}
                >
                  {aircraftRegisterOptionsStatusList.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </TableCell>
            <TableCell>
              <IconButton size="small" onClick={() => setAddDummyRegisterFormState({ ...addDummyRegisterFormState, show: false })}>
                <RemoveIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => {
                  //TODO: Validate addDummyRegisterFormState...
                  const type = MasterData.all.aircraftTypes.id[formFields.aircraftType.parse(addDummyRegisterFormState.aircraftType)];
                  list
                    .find(t => t.type === type)!
                    .dummyRegisters.push({
                      id: `dummy-${dummyAircraftRegisterIdCounter(x => x + 1)}`,
                      name: addDummyRegisterFormState.name.toUpperCase(),
                      baseAirport: addDummyRegisterFormState.baseAirport,
                      status: addDummyRegisterFormState.status
                    });
                  setAddDummyRegisterFormState({ ...addDummyRegisterFormState, show: false });
                }}
              >
                <CheckIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Collapse>
  );

  const tableHead = (
    <TableHead>
      <TableRow>
        <TableCell>
          <Typography variant="body2">Reg.</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" align="left">
            Base
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">State</Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">Group</Typography>
        </TableCell>
        <TableCell />
      </TableRow>
    </TableHead>
  );

  const aircraftRegisterRow = (t: AircraftRegistersPerTypeViewState, r: AircraftRegisterViewState) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <Typography variant="body2">{r.name}</Typography>
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <RefiningTextField
          formField={formFields.airport}
          disabled={loading}
          value={r.baseAirport}
          onChange={event => {
            r.baseAirport = event.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.stateCell}>
        <FormControl fullWidth>
          <Select
            classes={{ select: classes.select }}
            native
            variant="outlined"
            disabled={loading}
            value={r.status}
            onChange={event => {
              r.status = event.target.value as AircraftRegisterOptionsStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterOptionsStatusList.map(a => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell colSpan={2}>
        <Typography variant="body2">{r.groups.join(', ')}</Typography>
      </TableCell>
    </TableRow>
  );

  const dummyAircraftRegisterRow = (t: AircraftRegistersPerTypeViewState, r: DummyAircraftRegisterViewState) => (
    <TableRow key={r.id} hover={true} className={classNames({ [classes.backupRegister]: r.status === 'BACKUP', [classes.ignoredRegister]: r.status === 'IGNORED' })}>
      <TableCell className={classes.nameCell}>
        <RefiningTextField
          formField={formFields.label}
          value={r.name}
          disabled={loading}
          onChange={event => {
            r.name = event.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.baseAirportCell}>
        <RefiningTextField
          formField={formFields.airport}
          value={r.baseAirport}
          disabled={loading}
          onChange={event => {
            r.baseAirport = event.target.value;
            setList([...list]);
          }}
        />
      </TableCell>
      <TableCell className={classes.stateCell}>
        <FormControl fullWidth>
          <Select
            disabled={loading}
            classes={{ select: classes.select }}
            native
            variant="outlined"
            value={r.status}
            onChange={event => {
              r.status = event.target.value as AircraftRegisterOptionsStatus;
              setList([...list]);
            }}
          >
            {aircraftRegisterOptionsStatusList.map(a => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell />
      <TableCell>
        <IconButton
          size="small"
          onClick={() => {
            t.dummyRegisters.remove(r);
            setList([...list]);
          }}
        >
          <RemoveIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );

  return (
    <SideBarContainer
      onApply={() => {
        const dummyAircraftRegisters: DummyAircraftRegisterModel[] = list.flatMap<DummyAircraftRegisterModel>(t =>
          t.dummyRegisters.map<DummyAircraftRegisterModel>(r => ({
            id: r.id,
            name: formFields.label.parse(r.name),
            aircraftTypeId: t.type.id
          }))
        );
        const aircraftRegisterOptions: AircraftRegisterOptionsModel = {
          options: list.flatMap<AircraftRegisterOptionsModel['options'][number]>(t =>
            [...t.registers, ...t.dummyRegisters].map<AircraftRegisterOptionsModel['options'][number]>(r => ({
              aircraftRegisterId: r.id,
              status: r.status,
              baseAirportId: r.baseAirport === '' ? undefined : formFields.airport.parse(r.baseAirport)
            }))
          )
        };
        onApply(dummyAircraftRegisters, aircraftRegisterOptions);
      }}
      onAdd={() => setAddDummyRegisterFormState({ show: true, name: '', aircraftType: '', baseAirport: '', status: 'INCLUDED' })}
      label="Select Aircraft Registers"
      loading={loading}
      errorMessage={errorMessage}
    >
      <div className={classes.content}>
        <div className={classes.searchWrapper}>
          <Search disabled={loading} onQueryChange={query => setQuery(query)} />
        </div>

        {addDummyRegisterForm}
        <div className={addDummyRegisterFormState.show ? classes.bodyWithAddDummy : classes.body}>
          {list.map((t, index) => (
            <div key={t.type.id}>
              <Typography variant="h6" display="inline">
                Type: {t.type.name}
              </Typography>
              <Table size="small">
                {tableHead}
                <TableBody>
                  {filterOnProperties(t.registers, query, 'name').map(r => aircraftRegisterRow(t, r))}
                  {filterOnProperties(t.dummyRegisters, query, 'name').map(r => dummyAircraftRegisterRow(t, r))}
                </TableBody>
              </Table>
              {index !== list.length - 1 ? (
                <Fragment>
                  <br />
                  <br />
                </Fragment>
              ) : (
                <Fragment></Fragment>
              )}
            </div>
          ))}
        </div>
      </div>
    </SideBarContainer>
  );
};

export default SelectAircraftRegistersSideBar;
