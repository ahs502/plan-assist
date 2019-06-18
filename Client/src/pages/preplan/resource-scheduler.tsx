import React, { FC, Fragment, useState, useContext } from 'react';
import { Theme, IconButton, Select, OutlinedInput, Badge, Drawer, Portal } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { DoneAll as FinilizedIcon, LockOutlined as LockIcon, LockOpenOutlined as LockOpenIcon, Search as SearchIcon, SettingsOutlined as SettingsIcon } from '@material-ui/icons';
import MahanIcon, { MahanIconType } from '../../components/MahanIcon';
import LinkIconButton from '../../components/LinkIconButton';
import { NavBarToolsContainerContext } from '../preplan';
import AutoArrangerChangeLogSideBar from '../../components/preplan/resource-scheduler/AutoArrangerChangeLogSideBar';
import SearchFlightsSideBar from '../../components/preplan/resource-scheduler/SearchFlightsSideBar';
import ErrorsAndWarningsSideBar from '../../components/preplan/resource-scheduler/ErrorsAndWarningsSideBar';
import SelectAircraftRegistersSideBar from '../../components/preplan/resource-scheduler/SelectAircraftRegistersSideBar';
import SettingsSideBar from '../../components/preplan/resource-scheduler/SettingsSideBar';
import ResourceSchedulerView from '../../components/preplan/resource-scheduler/ResourceSchedulerView';
import Preplan from '../../business/Preplan';
import FlightRequirement, { WeekdayFlightRequirement } from '../../business/FlightRequirement';

const useStyles = makeStyles((theme: Theme) => ({
  sideBarBackdrop: {
    backgroundColor: 'transparent'
  },
  sideBarPaper: {
    top: 105
  },
  statusBar: {
    height: 54,
    backgroundColor: theme.palette.extraColors.backupRegister,
    margin: 0,
    padding: theme.spacing(2)
  },
  errorBadge: {
    margin: theme.spacing(2)
  },
  formDaysSelect: {
    padding: theme.spacing(1, 3)
  }
}));

type SideBar = 'SETTINGS' | 'SELECT_AIRCRAFT_REGISTERS' | 'SEARCH_FLIGHTS' | 'AUTO_ARRANGER_CHANGE_LOG' | 'OBJECTIONS';

export interface ResourceSchedulerPageProps {
  preplan: Preplan;
  onEditFlightRequirement: (flightRequirement: FlightRequirement) => void;
  onEditWeekdayFlightRequirement: (weekdayFlightRequirement: WeekdayFlightRequirement) => void;
}

const ResourceSchedulerPage: FC<ResourceSchedulerPageProps> = ({ preplan }) => {
  const [sideBar, setSideBar] = useState<{ sideBar?: SideBar; open: boolean; initialSearch?: string }>({ open: false });
  const [autoArrangerRunning, setAutoArrangerRunning] = useState(() => false); //TODO: Initialize by data from server.
  const [allFlightsFreezed, setAllFlightsFreezed] = useState(() => false); //TODO: Initialize from preplan flights.
  const navBarToolsContainer = useContext(NavBarToolsContainerContext);

  const classes = useStyles();

  const numberOfObjections: number = 12; //TODO: Not implemented.

  return (
    <Fragment>
      <Portal container={navBarToolsContainer}>
        <Fragment>
          <span>00:01:23</span>
          <IconButton color="inherit" onClick={() => alert('Not implemented.')}>
            {true ? <MahanIcon type={MahanIconType.CheckBoxEmpty} title="Stop Auto Arrange" /> : <MahanIcon type={MahanIconType.UsingChlorine} title="Start Auto Arrange" />}
          </IconButton>
          <IconButton color="inherit" title="Finilize Preplan">
            <FinilizedIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => alert('Not implemented.')} title={allFlightsFreezed ? 'Unfreeze All Flights' : 'Freeze All Flights'}>
            {allFlightsFreezed ? <LockOpenIcon /> : <LockIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={() => alert('Not implemented.')} title="Flight Requirments">
            <MahanIcon type={MahanIconType.FlightIcon} />
          </IconButton>
          <IconButton color="inherit" title="Reports">
            <MahanIcon type={MahanIconType.Chart} />
          </IconButton>
          <LinkIconButton to="/master-data" color="inherit" title="Master Data">
            <MahanIcon type={MahanIconType.TextFile} />
          </LinkIconButton>
          {/* <Select
            classes={{ select: classes.formDaysSelect }}
            native
            value={this.state.numberOfDays}
            onChange={this.handleChangeDays}
            id="outlined-age-native-simple"
            input={<OutlinedInput labelWidth={0} />}
            title="Zoom Level"
          >
            <option value={1}>One Day</option>
            <option value={2}>Two Days</option>
            <option value={3}>Three Days</option>
            <option value={7}>Seven Days</option>
            <option value={8}>Eight Days</option>
          </Select> */}
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'AUTO_ARRANGER_CHANGE_LOG', open: true })} title="Auto Arrange Change Log">
            <MahanIcon type={MahanIconType.Change} />
          </IconButton>
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SEARCH_FLIGHTS', open: true })} title="Search Flights">
            <SearchIcon />
          </IconButton>

          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'OBJECTIONS', open: true })} title="Errors and Warnings">
            <Badge badgeContent={numberOfObjections} color="secondary" invisible={!numberOfObjections}>
              <MahanIcon type={MahanIconType.Alert} fontSize="inherit" />
            </Badge>
          </IconButton>

          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SELECT_AIRCRAFT_REGISTERS', open: true })} title="Select Aircraft Register">
            <MahanIcon type={MahanIconType.Flights} />
          </IconButton>
          <IconButton color="inherit" onClick={() => setSideBar({ sideBar: 'SETTINGS', open: true })} title="Settings">
            <SettingsIcon />
          </IconButton>
        </Fragment>
      </Portal>

      <Drawer
        anchor="right"
        open={sideBar.open}
        onClose={() => setSideBar({ open: false })}
        ModalProps={{ BackdropProps: { classes: { root: classes.sideBarBackdrop } } }}
        classes={{ paper: classes.sideBarPaper }}
      >
        {sideBar.sideBar === 'SETTINGS' && <SettingsSideBar />}
        {sideBar.sideBar === 'SELECT_AIRCRAFT_REGISTERS' && <SelectAircraftRegistersSideBar initialSearch={sideBar.initialSearch} />}
        {sideBar.sideBar === 'SEARCH_FLIGHTS' && <SearchFlightsSideBar initialSearch={sideBar.initialSearch} />}
        {sideBar.sideBar === 'AUTO_ARRANGER_CHANGE_LOG' && <AutoArrangerChangeLogSideBar initialSearch={sideBar.initialSearch} />}
        {sideBar.sideBar === 'OBJECTIONS' && <ErrorsAndWarningsSideBar initialSearch={sideBar.initialSearch} objections={[]} />}
      </Drawer>

      <ResourceSchedulerView />
      <div className={classes.statusBar}>Status Bar</div>
    </Fragment>
  );
};

export default ResourceSchedulerPage;
